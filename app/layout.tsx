import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "GigMatcher — Find Verified AI Evaluation, Coding & Annotation Gigs",
  description:
    "Personalized matching platform for AI coding, prompt evaluation, data annotation, and QA gigs. Transparent pay rates, country eligibility verification, and application tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex min-h-screen flex-col bg-canvas-bg text-ink antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
