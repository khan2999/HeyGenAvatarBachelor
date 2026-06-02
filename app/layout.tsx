import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA — Human-AI Avatar Interface",
  description:
    "Real-time conversational interface with a HeyGen streaming AI avatar. Bachelor thesis project on human-AI interaction.",
  keywords: ["AI Avatar", "HeyGen", "Human-AI Interaction", "Conversational AI"],
  authors: [{ name: "Bachelor Thesis Project" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#050508",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for Google Fonts (loaded via globals.css @import) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-void text-ivory font-body antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
