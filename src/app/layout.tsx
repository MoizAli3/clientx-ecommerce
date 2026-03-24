import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { ChatWidget } from "@/components/chat/ChatWidget";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: {
    default: "MaxWatch — Pakistan's Premium Watch Store",
    template: "%s | MaxWatch",
  },
  description:
    "Pakistan's #1 premium watch store. Luxury, sports, and smart watches. Easy payment via JazzCash and EasyPaisa.",
  keywords: ["watches", "luxury watches", "pakistan", "jazzcash", "easypaisa", "maxwatch"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
