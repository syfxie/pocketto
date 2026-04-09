import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/components/StoreProvider";
import ToastContainer from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pocketto",
  description: "Your pocket-sized China trip planner",
  manifest: "/manifest.json",
  themeColor: "#2d5a3f",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pocketto",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans antialiased">
        <StoreProvider>{children}</StoreProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
