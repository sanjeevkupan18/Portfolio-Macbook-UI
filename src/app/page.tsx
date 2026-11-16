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
      alternateName: ["sanjucoding", "sanjeevkupan18", "Sanjeev", "Sanjeev Pandit"],
      jobTitle: portfolio.profile.role,
      description: portfolio.profile.summary,
      image: profileImage,
      url: siteUrl,
      email: portfolio.profile.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: portfolio.profile.location,
        addressCountry: "IN",
      },
      sameAs: [
        "https://github.com/sanjeevkupan18",
        "https://www.linkedin.com/in/sanjeevkupan18/",
        siteUrl,
      ],
      knowsAbout: portfolio.skills.map((s) => s.name),
      alumniOf: portfolio.education.map((e) => ({
        "@type": "CollegeOrUniversity",
        name: e.institution,
      })),
      mainEntityOfPage: { "@id": `${siteUrl}/#website` },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Sanjeev Kumar Pandit Portfolio (sanjucoding)",
      alternateName: [
        "sanjeev",
        "sanjeev portfolio",
        "sanjeevkupan18",
        "sanjeev kumar pandit",
        "sanjucoding",
        "sanjucoding portfolio",
        "sanjucoding macbook",
        "sanjucoding ios",
        "sanjeev macbook",
        "sanjeev ios",
        "portfolio macbook",
        "portfolio ios",
        "macbook portfolio",
        "ios portfolio",
      ],
      description: siteConfig.description,
      inLanguage: "en-IN",
      publisher: { "@id": `${siteUrl}/#person` },
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteUrl}/#profilepage`,
      url: siteUrl,
      name: "Sanjeev Kumar Pandit (sanjucoding) — MacBook UI & iOS Portfolio",
      isPartOf: { "@id": `${siteUrl}/#website` },
      mainEntity: { "@id": `${siteUrl}/#person` },
      description: siteConfig.description,
    },
    {
      "@type": "ItemList",
      "@id": `${siteUrl}/#projects`,
      name: "Projects by Sanjeev Kumar Pandit (sanjucoding / sanjeevkupan18)",
      itemListElement: portfolio.projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareApplication",
          name: project.name,
          description: project.description,
          applicationCategory: "WebApplication",
          operatingSystem: "Web",
          url: project.live || project.github || siteUrl,
        },
      })),
    },
  ],
};

export default function Page() {
  return (
    <>
      <OSRoot />
      <SeoContent />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
