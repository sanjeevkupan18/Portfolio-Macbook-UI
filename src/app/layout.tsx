import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { portfolio, siteConfig } from "@/data/portfolio";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.title, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: `${siteConfig.name} — Portfolio OS`,
  authors: [{ name: portfolio.profile.name, url: portfolio.profile.website }],
  creator: portfolio.profile.name,
  publisher: portfolio.profile.name,
  category: "technology",
  keywords: ["Sanjeev Kumar Pandit", "Full Stack Developer", "MERN", "React", "Node.js", "MongoDB", "Data Analytics", "Portfolio"],
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    shortcut: ["/icon.png"],
    apple: "/images/Sanjeev Photo.jpeg",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    locale: "en_IN",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${portfolio.profile.name} — ${portfolio.profile.role}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
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
