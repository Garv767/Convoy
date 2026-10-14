import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0f1117",
};

export const metadata: Metadata = {
  title: "Convoy · SRMIST Ride Sharing",
  description: "Campus transit & exam commute carpooling for SRMIST students.",
  icons: {
    icon: [
      { url: "/convoy-logo.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/convoy-logo.svg",
    shortcut: "/convoy-logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full`}>
      <body className="min-h-full bg-background text-text antialiased selection:bg-accent/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
