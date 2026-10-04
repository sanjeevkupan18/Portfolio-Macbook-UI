import { OSRoot } from "@/components/OSRoot";
import { SeoContent } from "@/components/SeoContent";
import { portfolio, siteConfig } from "@/data/portfolio";

const profileImage = new URL(portfolio.profile.avatar, siteConfig.url).toString();
const siteUrl = siteConfig.url;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: portfolio.profile.name,
      jobTitle: portfolio.profile.role,
      description: portfolio.profile.summary,
      image: profileImage,
      url: portfolio.profile.website,
      email: portfolio.profile.email,
      address: { "@type": "PostalAddress", addressLocality: portfolio.profile.location },
      sameAs: portfolio.socialLinks.filter((s) => s.id === "github" || s.id === "linkedin").map((s) => s.url),
      knowsAbout: portfolio.skills.map((s) => s.name),
      alumniOf: portfolio.education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.institution })),
      mainEntityOfPage: { "@id": `${siteUrl}/#website` },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: portfolio.profile.name,
      description: portfolio.profile.shortBio,
      inLanguage: "en-IN",
      publisher: { "@id": `${siteUrl}/#person` },
    },
  ],
};

export default function Page() {
  return (
    <>
      <OSRoot />
      <SeoContent />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
