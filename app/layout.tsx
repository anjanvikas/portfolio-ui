import type { Metadata } from "next";
import { Space_Grotesk, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Runs synchronously before first paint to set the `.dark` class from the
// persisted choice (or the OS preference when none) — prevents a flash of the
// wrong theme. Kept inline + minified so it's part of the static HTML and never
// forces a page to render dynamically. Mirrors the logic in ThemeProvider.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

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
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
