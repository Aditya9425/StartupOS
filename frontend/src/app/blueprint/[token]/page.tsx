"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Download, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import ValidationScore from "@/components/ValidationScore";
import BlueprintPDF from "@/components/BlueprintPDF";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <Button disabled className="bg-foreground text-background rounded-full"><Download size={16} className="mr-2" />Loading PDF...</Button> }
);

const AGENT_ORDER = ["ceo", "product", "marketing", "finance", "engineering"];
const AGENT_NAMES = {
  ceo: "CEO Agent",
  product: "Product Agent",
  marketing: "Marketing Agent",
  finance: "Finance Agent",
  engineering: "Engineering Agent"
};

interface SharedBlueprintData {
  startup_name: string;
  idea: string;
  validation_score: any;
  blueprint: Record<string, string>;
  view_count: number;
  created_at: string;
  challenges?: string[];
}

export default function SharedBlueprintPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const { token } = unwrappedParams;

  const [data, setData] = useState<SharedBlueprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/api/share/view/${token}`);
        if (!res.ok) {
          setError("Blueprint not found or link has expired.");
          return;
        }
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError("Failed to load blueprint.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center font-bold text-xl bg-secondary/50 mb-4">S</div>
          <div className="text-muted-foreground text-sm">Loading blueprint...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Oops!</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.push("/")} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
          Go to StartupOS
        </Button>
      </div>
    );
  }

  const { startup_name, idea, validation_score, blueprint, view_count, created_at, challenges } = data;
  const dateStr = new Date(created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const renderContent = (content: string) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim() !== '');
    return paragraphs.map((p, i) => (
      <p key={i} className="mb-4 text-[#888888] leading-relaxed text-[15px] whitespace-pre-wrap">
        {p.trim().replace(/\n/g, ' ')}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-8 h-8 rounded-xl border border-border flex items-center justify-center font-bold text-sm bg-secondary/50">
              S
            </div>
            <span className="font-semibold hidden sm:inline">StartupOS</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground hidden md:flex items-center gap-1.5">
              <Eye size={14} />
              Seen by {view_count} founders
            </div>
            <Button onClick={() => router.push("/")} className="rounded-full bg-foreground text-background hover:bg-foreground/90 text-xs h-9">
              Create yours free <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              AI-Generated Blueprint
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {startup_name || "Unnamed Startup"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              &quot;{String(idea)}&quot;
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <PDFDownloadLink
              document={
                <BlueprintPDF 
                  startupName={startup_name}
                  blueprint={blueprint}
                  validationScore={validation_score}
                  challenges={challenges || []}
                  date={dateStr}
                />
              }
              fileName={`${startup_name.replace(/\s+/g, '-').toLowerCase()}-blueprint.pdf`}
            >
              {({ loading }) => (
                <Button disabled={loading} className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 w-full md:w-auto">
                  <Download size={16} className="mr-2" />
                  {loading ? "Generating PDF..." : "Download PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>

        {/* Validation Score */}
        {validation_score && (
          <div className="mb-16">
            <ValidationScore score={validation_score} />
          </div>
        )}

        {/* Full Blueprint Sections */}
        <div className="space-y-16">
          <div className="border-b border-[rgba(255,255,255,0.07)] pb-4 mb-8">
            <h2 className="text-2xl font-bold">The Blueprint</h2>
          </div>
          
          {AGENT_ORDER.map((agentKey) => {
            const output = blueprint?.[agentKey];
            if (!output) return null;
            return (
              <div key={agentKey} className="group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center border border-border">
                    <span className="text-xs font-bold text-foreground">
                      {agentKey.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-medium">
                    {AGENT_NAMES[agentKey as keyof typeof AGENT_NAMES]} Output
                  </h3>
                </div>
                <div className="pl-4 md:pl-12 border-l-2 border-border/30 group-hover:border-foreground/30 transition-colors">
                  {renderContent(output)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-24 pt-12 border-t border-[rgba(255,255,255,0.07)] flex flex-col items-center text-center">
          <h3 className="text-2xl font-bold mb-4">Want your own AI blueprint?</h3>
          <p className="text-muted-foreground mb-8 max-w-md">
            StartupOS generates comprehensive, validated startup blueprints using a team of 5 specialized AI agents.
          </p>
          <Button onClick={() => router.push("/")} className="rounded-full bg-foreground text-background hover:bg-foreground/90 h-12 px-8 font-medium">
            Launch Startup Free <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}
