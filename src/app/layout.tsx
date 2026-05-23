import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Base Launchpad - Launch NFT Collections on Base in 30 Seconds",
  description: "The premier no-code launchpad for creators on the Base blockchain. Deploy NFT collections, establish public mint pages, and manage token supplies instantly.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Web3Provider>
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: "rgba(9, 13, 22, 0.9)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                color: "#f9fafb",
                backdropFilter: "blur(8px)",
              }
            }} 
          />
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Web3Provider>
      </body>
    </html>
  );
}
