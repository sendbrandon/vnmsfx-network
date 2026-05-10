import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "VNMSFX — The funniest network in New York.",
  description:
    "Dangerously good AI videos from New York. We make the internet feel like the internet again. New drops every Thursday.",
  openGraph: {
    title: "VNMSFX — The funniest network in New York.",
    description:
      "Dangerously good AI videos from New York. We make the internet feel like the internet again.",
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
      <body>
        {children}
        <AudioPlayer />
      </body>
    </html>
  );
}
