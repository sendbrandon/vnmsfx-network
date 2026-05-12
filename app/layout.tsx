import type { Metadata, Viewport } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AudioPlayer } from "./components/AudioPlayer";
import "./globals.css";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://vnmsfx.com";
const SITE_NAME = "VNMSFX";
const TITLE = "VNMSFX — AI-Native Comedy Network";
const DESCRIPTION =
  "VNMSFX is an AI-native comedy network from New York making short-form shows, character series, puppet comedy, and internet-first video drops.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — VNMSFX",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "VNMSFX",
    "AI comedy network",
    "AI video",
    "AI shorts",
    "Hank Beans Roar",
    "Hank, Beans & Roar",
    "Checkpoint Chisme",
    "comedy network",
    "New York comedy",
    "AI satire",
    "felt puppet comedy",
    "dangerously good AI videos",
  ],
  authors: [{ name: "Brandon Adams", url: "https://vnmsfx.com" }],
  creator: "Brandon Adams",
  publisher: "VNMSFX LLC",
  category: "entertainment",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VNMSFX — AI-Native Comedy Network",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@vnmsfx",
    creator: "@vnmsfx",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#CFA8FA" },
    { media: "(prefers-color-scheme: dark)", color: "#CFA8FA" },
  ],
  colorScheme: "light",
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  legalName: "VNMSFX LLC",
  alternateName: "VNMSFX Network",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/vnmsfx-logo-black.png`,
  description: DESCRIPTION,
  founder: { "@type": "Person", name: "Brandon Adams" },
  foundingDate: "2024",
  foundingLocation: { "@type": "Place", name: "New York, NY, USA" },
  email: "brandon@pushto6.com",
  sameAs: [
    "https://x.com/vnmsfx",
    "https://www.youtube.com/@vnmsfx",
    "https://www.tiktok.com/@vnmsfxreels",
  ],
  // The two flagship shows as creative works under the network
  "subjectOf": [
    {
      "@type": "TVSeries",
      name: "Hank, Beans & Roar",
      url: `${SITE_URL}/hank-beans-roar`,
      genre: ["Comedy", "Short-form", "AI"],
      description:
        "A short-form chaos series about a clueless human, a stressed-out dog, and a lion who turns every normal situation into a disaster.",
    },
    {
      "@type": "TVSeries",
      name: "Checkpoint Chisme",
      url: `${SITE_URL}/checkpoint-chisme`,
      genre: ["Comedy", "Puppet", "Workplace", "AI"],
      description:
        "A felt puppet comedy series where airport security, gossip, IDs, passengers, and bureaucracy collide.",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body>
        {children}
        <AudioPlayer />
        <Analytics />
      </body>
    </html>
  );
}
