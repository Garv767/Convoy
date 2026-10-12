import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Convoy | SRMIST Commute & Exam Transit",
  description: "Verified student ridesharing and exam commute pooling for SRMIST Kattankulathur.",
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
