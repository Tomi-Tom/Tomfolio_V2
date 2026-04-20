import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const ROUTES = ["", "/playground", "/love-timer"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tombp.fr";
  const now = new Date();

  return ROUTES.flatMap((route) =>
    routing.locales.map((locale) => {
      const path = locale === routing.defaultLocale ? route : `/${locale}${route}`;
      return {
        url: `${baseUrl}${path || "/"}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [
              l,
              `${baseUrl}${l === routing.defaultLocale ? route : `/${l}${route}`}` || `${baseUrl}/`,
            ])
          ),
        },
      };
    })
  );
}
