import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavSidebar } from "@/components/app/NavSidebar";
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
  title: "Domu — Technical Operations",
  description: "Internal portfolio monitoring and voicebot operations dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full`}
    >
      <body className="h-full flex flex-col bg-background text-foreground antialiased">
        {/* Persistent demo environment notice */}
        <div className="shrink-0 bg-amber-950/50 border-b border-amber-800/30 py-1.5 text-center text-xs tracking-wide text-amber-300/70">
          Demo environment — representative data
        </div>

        {/* App shell: sidebar + scrollable content */}
        <div className="flex flex-1 overflow-hidden">
          <NavSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
