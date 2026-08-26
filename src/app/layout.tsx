import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Domu — Technical Operations Command Center",
  description: "Internal portfolio monitoring and voicebot operations dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-300">
        {/* Persistent demo environment notice */}
        <div className="bg-amber-950/70 border-b border-amber-800/50 text-amber-300/90 text-xs text-center py-1.5 tracking-wide shrink-0">
          Demo environment — representative data
        </div>

        {/* Sticky app header */}
        <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-800 shrink-0">
          <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 text-xs uppercase tracking-widest font-medium">Domu Technology</span>
              <span className="text-slate-700 select-none">·</span>
              <Link href="/" className="text-slate-200 font-semibold hover:text-white transition-colors">
                Technical Operations Command Center
              </Link>
            </div>
            <span className="text-slate-600 text-xs font-mono">2026-08-26</span>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
