import re

with open("frontend/src/app/agents/page.tsx", "r") as f:
    content = f.read()

# 1. Imports
content = content.replace(
    'import { Loader2 } from "lucide-react";',
    'import { Loader2 } from "lucide-react";\nimport ReactMarkdown from \'react-markdown\';'
)

# 2. Add handleRecalculateScore and Recalculate Score button
# First, add states
content = content.replace(
    'const [confirmRegenerate, setConfirmRegenerate] = useState(false);',
    'const [confirmRegenerate, setConfirmRegenerate] = useState(false);\n  const [isRecalculating, setIsRecalculating] = useState(false);'
)

# Second, add function
func = """
  const handleRecalculateScore = async () => {
    if (!startupId) return;
    setIsRecalculating(true);
    try {
      const res = await fetch(`${API_URL}/api/validate-idea`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startup_id: startupId }),
      });
      if (res.ok) {
        showToast("Score updated ✓");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecalculating(false);
    }
  };
"""
content = content.replace(
    'const handleRegenerate = async () => {',
    func + '\n  const handleRegenerate = async () => {'
)

# Third, add button next to "Regenerate Blueprint"
btns = """            {isRecalculating ? (
              <button disabled className="ghost-btn border border-zinc-700 text-zinc-400 text-sm px-4 py-2 rounded-lg opacity-50 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Recalculating...
              </button>
            ) : (
              <button 
                onClick={handleRecalculateScore}
                className="ghost-btn border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Recalculate Score
              </button>
            )}
            
            {regenerating ? ("""
content = content.replace('{regenerating ? (', btns)


# 3. Replace blueprint rendering
def replacer(m):
    key = m.group(1)
    return f'<div className="prose prose-invert prose-sm max-w-none prose-p:text-zinc-400 prose-p:leading-relaxed prose-strong:text-white prose-strong:font-medium prose-li:text-zinc-400 prose-headings:text-white prose-headings:font-medium max-h-96 overflow-y-auto pr-2"><ReactMarkdown>{{blueprint.{key}}}</ReactMarkdown></div>'

content = re.sub(
    r'<div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-2">\s*\{blueprint\.(\w+)\}\s*</div>',
    replacer,
    content
)

def side_panel_replacer(m):
    return f'<div className="prose prose-invert prose-sm max-w-none prose-p:text-zinc-400 prose-p:leading-relaxed prose-strong:text-white prose-strong:font-medium prose-li:text-zinc-400 prose-headings:text-white prose-headings:font-medium"><ReactMarkdown>{{blueprint[selectedAgent as keyof typeof blueprint]}}</ReactMarkdown></div>'

content = re.sub(
    r'<div className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">\s*\{blueprint\[selectedAgent as keyof typeof blueprint\]\}\s*</div>',
    side_panel_replacer,
    content
)

with open("frontend/src/app/agents/page.tsx", "w") as f:
    f.write(content)
