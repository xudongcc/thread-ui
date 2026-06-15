import "./global.css";

import { RootProvider } from "fumadocs-ui/provider/next";
import { Geist, Geist_Mono, Inter } from "next/font/google";

import { AlertDialogProvider } from "@/components/thread-ui/alert-dialog";
import { ToastProvider } from "@/components/thread-ui/toast";

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
    <html suppressHydrationWarning className={inter.variable} lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <RootProvider>
          {children}
          <AlertDialogProvider />
          <ToastProvider />
        </RootProvider>
      </body>
    </html>
  );
}
