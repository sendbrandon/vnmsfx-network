import type { Metadata } from "next";
import { Archivo_Black, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  title: "VNMSFX — The funniest network in New York.",
  description:
    "VNMSFX is a New York network making AI work that doesn't look like AI work. We make the internet feel like the internet again.",
  openGraph: {
    title: "VNMSFX — The funniest network in New York.",
    description:
      "We make the internet feel like the internet again. AI satire, characters, and dark-button comedy from New York.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
