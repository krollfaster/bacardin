import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCaseBySlug } from "@/lib/cases";
import { CaseNavigation } from "@/components/layout/CaseNavigation";
import { ComponentCaseView } from "./ComponentCaseView";
import { GalleryCaseView } from "./GalleryCaseView";

interface CasePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CasePageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const caseData = await getCaseBySlug(slug);

  if (!caseData || !caseData.published) {
    return {
      title: locale === "ru" ? "Кейс не найден" : "Case not found",
    };
  }

  const title = locale === "en" && caseData.title_en ? caseData.title_en : caseData.title;
  const description = locale === "en" && caseData.description_en
    ? caseData.description_en
    : caseData.description;
  const authorName = locale === "ru" ? "Эрнест фон Шульдайс" : "Ernest von Shuldays";

  return {
    title: `${title} | ${authorName}`,
    description: description || undefined,
    openGraph: {
      title: `${title} | ${authorName}`,
      description: description || undefined,
      images: caseData.coverImage ? [{ url: caseData.coverImage }] : undefined,
    },
    alternates: {
      canonical: `/${locale}/cases/${slug}`,
      languages: {
        ru: `/ru/cases/${slug}`,
        en: `/en/cases/${slug}`,
      },
    },
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const { slug, locale } = await params;
  const caseData = await getCaseBySlug(slug);

  // Если кейс не найден или не опубликован - 404
  if (!caseData || !caseData.published) {
    notFound();
  }

  // Определяем title и description по локали
  const title = locale === "en" && caseData.title_en ? caseData.title_en : caseData.title;
  const description = locale === "en" ? caseData.description_en : caseData.description;

  // Определяем highlights по локали
  const highlights = locale === "en" && caseData.highlights_en && caseData.highlights_en.length > 0
    ? caseData.highlights_en
    : caseData.highlights;

  // Определяем ленту элементов по локали с fallback
  const getItems = () => {
    if (locale === "en" && caseData.items_en && caseData.items_en.length > 0) {
      return caseData.items_en;
    }
    return caseData.items;
  };

  const items = getItems();
  const infoBlocks = locale === "en" && caseData.infoBlocks_en ? caseData.infoBlocks_en : caseData.infoBlocks;

  return (
    <main className="bg-background min-h-screen">
      <CaseNavigation />

      {caseData.type === "component" && caseData.componentUrl && (
        <ComponentCaseView componentUrl={caseData.componentUrl} title={title} description={description} />
      )}

      {caseData.type === "gallery" && (
        <GalleryCaseView
          title={title}
          description={description}
          logo={caseData.logo}
          images={caseData.images}
          layout={caseData.galleryLayout}
          items={items}
          highlights={highlights}
          infoBlocks={infoBlocks}
          locale={locale}
        />
      )}
    </main>
  );
}
