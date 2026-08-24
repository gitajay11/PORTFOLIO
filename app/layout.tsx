import type { Metadata, Viewport } from "next";
import ChatBot from "@/components/ChatBot";
import CursorGlow from "@/components/CursorGlow";
import Nav from "@/components/Nav";
import ScrollVideoBackground from "@/components/ScrollVideoBackground";
import SocialDock from "@/components/SocialDock";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ajay K — Developer",
    // Sub-pages (e.g. /education/qualification) set title: "Qualification"
    // and this composes it into "Qualification — Ajay K".
    template: "%s — Ajay K",
  },
  description:
    "Developer portfolio — building fast, resilient software for the web.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>%F0%9F%92%BB</text></svg>",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Fixed behind everything; scrubbed by whole-document scroll on
            whichever route is mounted. Lives here, not in page.tsx, so it
            and the rest of the chrome persist across every route. */}
        <ScrollVideoBackground />
        <CursorGlow />
        <Nav />

        {/* Fixed on every screen of the site */}
        <SocialDock />
        <ChatBot />

        {children}
      </body>
    </html>
  );
}
