import { MetadataRoute } from "next";
import { getPublishedCases } from "@/lib/cases";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://bacardin.vercel.app";
    const cases = await getPublishedCases();

    // Статические страницы для каждой локали
    const staticPages: MetadataRoute.Sitemap = [
        { url: `${baseUrl}/ru`, lastModified: new Date(), priority: 1 },
        { url: `${baseUrl}/en`, lastModified: new Date(), priority: 1 },
        { url: `${baseUrl}/ru/cases`, lastModified: new Date(), priority: 0.8 },
        { url: `${baseUrl}/en/cases`, lastModified: new Date(), priority: 0.8 },
        {
            url: `${baseUrl}/ru/recommendation-letter`,
            lastModified: new Date(),
            priority: 0.7,
        },
        {
            url: `${baseUrl}/en/recommendation-letter`,
            lastModified: new Date(),
            priority: 0.7,
        },
    ];

    // Динамические страницы кейсов
    const casePages: MetadataRoute.Sitemap = cases.flatMap((c) => [
        {
            url: `${baseUrl}/ru/cases/${c.slug}`,
            lastModified: new Date(c.updatedAt),
            priority: 0.6,
        },
        {
            url: `${baseUrl}/en/cases/${c.slug}`,
            lastModified: new Date(c.updatedAt),
            priority: 0.6,
        },
    ]);

    return [...staticPages, ...casePages];
}
