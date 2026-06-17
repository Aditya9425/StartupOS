import glob
import re

files = glob.glob("/home/aditya-bathla/Projects/StartupOS/frontend/src/app/*/page.tsx")

pattern = re.compile(r'// Subcomponents\n+.*?return \(\s*<[aA]\s*href=\{href\}.*?\s*\);\s*}\n', re.DOTALL)
pattern_link = re.compile(r'// Subcomponents\n+.*?return \(\s*<Link\s*href=\{href\}.*?\s*\);\s*}\n', re.DOTALL)
pattern_func = re.compile(r'function NavItem.*?;\s*}\n', re.DOTALL)

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    if "onboarding" in file or "blueprint" in file:
        continue

    content = pattern.sub('// Subcomponents\n', content)
    content = pattern_link.sub('// Subcomponents\n', content)
    content = pattern_func.sub('', content)

    # I'll also just check if there's any dangling `  return (\n    <a\n      href={href}` block
    dangling_pattern = re.compile(r'\s*return \(\s*<[aA]\s*href=\{href\}.*?\s*\);\s*}\n', re.DOTALL)
    if "href={href}" in content and "function NavItem" not in content:
         content = dangling_pattern.sub('\n', content)

    with open(file, 'w') as f:
        f.write(content)
        
print("Cleaned dangling NavItems.")
