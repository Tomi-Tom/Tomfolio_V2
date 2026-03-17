import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tombp.fr";
  const API_URL = process.env.API_URL || "http://localhost:4000";

  let projectUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/api/projects`);
    const { data: projects } = await res.json();
    // No individual project pages in V1, but ready for V2
  } catch {
    // API might not be running during build
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
