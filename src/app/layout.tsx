import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { NavSidebar } from "@/components/app/NavSidebar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
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
      className={`${inter.variable} ${geistMono.variable} dark h-full`}
    >
      <body className="h-full flex flex-col bg-background text-foreground antialiased">
        {/* Subtle demo notice — visible but not distracting */}
        <div className="shrink-0 border-b border-border/30 py-[5px] text-center">
          <span className="text-[10px] tracking-wide text-muted-foreground/35">
            Demo environment · representative data
          </span>
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
