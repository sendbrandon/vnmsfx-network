import type { Metadata, Viewport } from "next";
import { Archivo_Black, Inter } from "next/font/google";
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
const TITLE = "VNMSFX — The funniest network in New York";
const DESCRIPTION =
  "Dangerously good AI videos from New York. Watch Hank & Beans, Checkpoint Chisme, and new drops every Thursday. We make the internet feel like the internet again.";

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
    "AI video",
    "AI shorts",
    "Hank & Beans",
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
  classification: "Entertainment / Video Network",

  alternates: {
    canonical: SITE_URL,
  },

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
        alt: "VNMSFX — The funniest network in New York. We make the internet feel like the internet again.",
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

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
  url: SITE_URL,
  logo: `${SITE_URL}/brand/vnmsfx-logo-black.png`,
  description: DESCRIPTION,
  founder: {
    "@type": "Person",
    name: "Brandon Adams",
  },
  foundingDate: "2024",
  foundingLocation: {
    "@type": "Place",
    name: "New York, NY, USA",
  },
  email: "brandon@pushto6.com",
  sameAs: [
    "https://x.com/vnmsfx",
    "https://www.youtube.com/@vnmsfx",
    "https://www.tiktok.com/@vnmsfxreels",
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
      </body>
    </html>
  );
}
