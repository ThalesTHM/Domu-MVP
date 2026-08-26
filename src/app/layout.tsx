import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { NavSidebar } from "@/components/app/NavSidebar";
import { Analytics } from "@vercel/analytics/next";
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const isChallenge = (await cookies()).get('dataMode')?.value === 'challenge';
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} dark h-full`}
    >
      <body className="h-full flex flex-col bg-background text-foreground antialiased">
        {/* Mode-aware demo notice */}
        <div className={`shrink-0 border-b py-[5px] text-center ${
          isChallenge ? 'border-amber-500/25' : 'border-border/30'
        }`}>
          <span className={`text-[10px] tracking-wide ${
            isChallenge ? 'text-amber-400/70' : 'text-muted-foreground/35'
          }`}>
            {isChallenge
              ? 'Development mode \u00b7 challenge-provided data'
              : 'Demo environment \u00b7 representative data'}
          </span>
        </div>

        {/* App shell: sidebar + scrollable content */}
        <div className="flex flex-1 overflow-hidden">
          <NavSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
