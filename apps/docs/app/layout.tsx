import "./global.css";

import { RootProvider } from "fumadocs-ui/provider/next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Providers } from "./providers";
import type { Metadata } from "next";

import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL("https://thread-ui.vercel.app"),
};

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html
      suppressHydrationWarning
      className={cn("font-sans", inter.variable)}
      lang="en"
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <RootProvider>
          <Providers>{children}</Providers>
        </RootProvider>
      </body>
    </html>
  );
}
