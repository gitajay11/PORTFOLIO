import type { Metadata, Viewport } from "next";
import ChatBot from "@/components/ChatBot";
import CursorGlow from "@/components/CursorGlow";
import IntroOverlay from "@/components/IntroOverlay";
import Nav from "@/components/Nav";
import ScrollVideoBackground from "@/components/ScrollVideoBackground";
import SocialDock from "@/components/SocialDock";
import "./globals.css";

const SITE_URL = "https://www.ajaykumarak.online";
const DESCRIPTION =
  "Developer portfolio — building fast, resilient software for the web.";

export const metadata: Metadata = {
  // Absolute base for og:image and og:url. WhatsApp, Telegram and the rest
  // reject relative image paths, so without this the preview shows no logo.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AJAYKUMAR",
    // Sub-pages (e.g. /education/qualification) set title: "Qualification"
    // and this composes it into "Qualification — AJAYKUMAR".
    template: "%s — AJAYKUMAR",
  },
  description: DESCRIPTION,
  // Points straight at the logo in public/ rather than Next's file-
  // convention app/icon.png + app/apple-icon.png, which required a
  // separate flattened/resized copy of the same image.
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  // og:/twitter: titles and descriptions are deliberately left unset here so
  // each route's own `title` and `description` flow into them — sharing
  // /contact previews as "Contact — AJAYKUMAR", not the site default.
  openGraph: {
    type: "website",
    siteName: "AJAYKUMAR",
    url: SITE_URL,
    locale: "en_US",
    // 1200x630 keeps the large card on Facebook/Telegram/LinkedIn/X, and the
    // logo sits dead centre so WhatsApp's square crop can't clip it. Kept
    // well under WhatsApp's ~300 kB ceiling, past which it shows no image.
    //
    // Truecolor (non-indexed, non-interlaced) PNG. The indexed-palette
    // variant rendered on WhatsApp Desktop but not on WhatsApp mobile;
    // this matches forgebyte.online's working image in kind.
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "AJAYKUMAR — developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
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
