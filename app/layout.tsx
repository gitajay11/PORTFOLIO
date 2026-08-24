import type { Metadata, Viewport } from "next";
import ChatBot from "@/components/ChatBot";
import CursorGlow from "@/components/CursorGlow";
import IntroOverlay from "@/components/IntroOverlay";
import Nav from "@/components/Nav";
import ScrollVideoBackground from "@/components/ScrollVideoBackground";
import SocialDock from "@/components/SocialDock";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AJAYKUMAR",
    // Sub-pages (e.g. /education/qualification) set title: "Qualification"
    // and this composes it into "Qualification — AJAYKUMAR".
    template: "%s — AJAYKUMAR",
  },
  description:
    "Developer portfolio — building fast, resilient software for the web.",
  // No `icons` field: app/icon.png and app/apple-icon.png (the AK logo) are
  // picked up automatically by Next's file-convention favicon handling.
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
        {/* Homepage-only splash; suppresses itself everywhere else (see
            usePathname check inside). Lives here rather than in page.tsx so
            it, like the rest of the chrome, is unaffected by client-side
            route transitions remounting the page content underneath it. */}
        <IntroOverlay />

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
