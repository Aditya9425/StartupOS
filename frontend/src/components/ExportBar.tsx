"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Copy, Share2, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlueprintPDF from "./BlueprintPDF";

// Dynamically import PDFDownloadLink to avoid SSR issues with react-pdf
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false, loading: () => <Button disabled className="bg-foreground text-background rounded-full"><Download size={16} className="mr-2" />Loading PDF...</Button> }
);

interface ExportBarProps {
  startup: any;
  blueprint: any;
}

export default function ExportBar({ startup, blueprint }: ExportBarProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareData, setShareData] = useState<{ token: string; views: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/share/${startup.id}`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setShareData({ token: data.share_token, views: data.view_count });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSharing(false);
    }
  };

  const shareUrl = shareData ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/blueprint/${shareData.token}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=Check out my AI-generated startup blueprint! ${encodeURIComponent(shareUrl)}`);
  };

  const handleLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
  };

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <div className="flex items-center gap-4 mt-6">
        <PDFDownloadLink
          document={
            <BlueprintPDF 
              startupName={startup.name}
              blueprint={blueprint}
              validationScore={startup.validation_score}
              challenges={startup.challenges}
              date={today}
            />
          }
          fileName={`${startup.name.replace(/\s+/g, '-').toLowerCase()}-blueprint.pdf`}
        >
          {({ loading }) => (
            <Button disabled={loading} className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 font-medium">
              <Download size={16} className="mr-2" />
              {loading ? "Generating PDF..." : "Download PDF"}
            </Button>
          )}
        </PDFDownloadLink>

        <Button onClick={handleShare} variant="outline" className="rounded-full px-6 border-border text-foreground hover:bg-secondary/50 font-medium">
          <Share2 size={16} className="mr-2" />
          {isSharing ? "Creating link..." : "Share Blueprint"}
        </Button>
      </div>

      {shareData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111111] border border-[rgba(255,255,255,0.07)] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setShareData(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white"
            >
              ✕
            </button>
            
            <h3 className="text-xl font-semibold text-white mb-2">Share your Blueprint</h3>
            <p className="text-[#666666] text-sm mb-6">
              Anyone with this link can view your startup&apos;s validation score and AI-generated blueprint.
            </p>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1 bg-black border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-3 text-sm text-[#aaaaaa] truncate select-all">
                {shareUrl}
              </div>
              <Button onClick={handleCopy} className="bg-white text-black hover:bg-neutral-200 rounded-xl px-4 py-3 h-auto">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>

            <div className="flex gap-3 mb-6">
              <Button onClick={handleWhatsApp} className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl">
                WhatsApp
              </Button>
              <Button onClick={handleLinkedIn} className="flex-1 bg-[#0A66C2] hover:bg-[#0958a8] text-white rounded-xl">
                LinkedIn
              </Button>
            </div>

            <div className="text-center text-xs text-[#666666] border-t border-[rgba(255,255,255,0.07)] pt-4">
              Seen by {shareData.views} founders
            </div>
          </div>
        </div>
      )}
    </>
  );
}
