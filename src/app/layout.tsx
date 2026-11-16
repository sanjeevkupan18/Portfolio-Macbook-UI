import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { portfolio, siteConfig } from "@/data/portfolio";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: `${siteConfig.name} — MacBook UI & iOS Portfolio OS`,
  authors: [
    { name: portfolio.profile.name, url: portfolio.profile.website },
    { name: "sanjucoding", url: portfolio.profile.website },
    { name: "sanjeevkupan18", url: "https://github.com/sanjeevkupan18" },
  ],
  creator: "Sanjeev Kumar Pandit (sanjucoding)",
  publisher: "Sanjeev Kumar Pandit",
  category: "technology",
  keywords: siteConfig.keywords,
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: ["/icon.png"],
    apple: "/images/Sanjeev Photo.jpeg",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: `${siteConfig.name} (${siteConfig.handle})`,
    title: siteConfig.title,
    description: siteConfig.description,
    locale: "en_IN",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${portfolio.profile.name} (sanjucoding) — MacBook UI & iOS Portfolio` }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    creator: "@sanjeevkupan18",
    images: ["/opengraph-image"],
  },
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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#000000" }, { media: "(prefers-color-scheme: light)", color: "#000000" }],
};

// Runs before first paint so the saved theme/accent never flashes. Static string, no user input.
const themeScript = `try{var p=JSON.parse(localStorage.getItem("sp-os:prefs")||"{}");var t=p.theme||"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.dataset.theme=d?"dark":"light";r.dataset.accent=p.accent||"blue";r.style.colorScheme=d?"dark":"light"}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
