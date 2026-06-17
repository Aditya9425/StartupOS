import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import ApiStatus from "@/components/ApiStatus";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "StartupOS",
  description: "Your startup. Run by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark bg-background text-foreground", "font-sans", geist.variable)}>
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        <ApiStatus />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
