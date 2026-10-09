import { MetadataRoute } from "next";
import { MOCK_GIGS } from "@/data/gigs";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://gigmatcher.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Core static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/guides`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Category indexable hubs
  const categories = [
    "ai-coding",
    "ai-evaluation",
    "data-annotation",
    "software-qa-testing",
    "writing-content",
    "language-translation",
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/categories/${cat}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  // Guide detailed pages
  const guideSlugs = [
    "ai-evaluator-onboarding-guide",
    "coding-benchmarks-guide",
    "country-restrictions-and-payouts",
  ];

  const guidePages: MetadataRoute.Sitemap = guideSlugs.map((slug) => ({
    url: `${BASE_URL}/guides/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Gig listing pages (public published listings only)
  const gigPages: MetadataRoute.Sitemap = MOCK_GIGS.map((gig) => ({
    url: `${BASE_URL}/gigs/${gig.slug}`,
    lastModified: gig.lastReviewedAt ? new Date(gig.lastReviewedAt) : now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [...staticPages, ...categoryPages, ...guidePages, ...gigPages];
}
