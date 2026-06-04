import type { Metadata } from "next";
import { Space_Grotesk, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const siteURL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const homepageOGImage =
  process.env.NEXT_PUBLIC_HOMEPAGE_OG_URL ?? `${siteURL}/og-home.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteURL),
  title: "Anjan Vikas Reddy",
  description: "Portfolio of Anjan Vikas Reddy — engineer, builder, writer.",
  openGraph: {
    type: "website",
    url: siteURL,
    siteName: "Anjan Vikas Reddy",
    title: "Anjan Vikas Reddy",
    description: "Portfolio of Anjan Vikas Reddy — engineer, builder, writer.",
    images: [{ url: homepageOGImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anjan Vikas Reddy",
    description: "Portfolio of Anjan Vikas Reddy — engineer, builder, writer.",
    images: [homepageOGImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
