import { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://remotasks.si";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/gigs/", "/categories/", "/guides/", "/privacy", "/terms"],
        disallow: [
          "/dashboard",
          "/profile",
          "/onboarding",
          "/applications",
          "/admin",
          "/api/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
