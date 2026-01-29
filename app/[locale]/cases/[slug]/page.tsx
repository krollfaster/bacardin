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

  // Определяем подпись под хайлайтами по локали
  const highlightFooter = locale === "en" && caseData.highlightFooter_en
    ? caseData.highlightFooter_en
    : caseData.highlightFooter;

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
          images={caseData.images}
          layout={caseData.galleryLayout}
          highlights={highlights}
          highlightFooter={highlightFooter}
          locale={locale}
        />
      )}
    </main>
  );
}
