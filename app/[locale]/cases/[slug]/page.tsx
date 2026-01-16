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

  return (
    <main className="min-h-screen bg-background">
      <CaseNavigation />

      {caseData.type === "component" && caseData.componentUrl && (
        <ComponentCaseView componentUrl={caseData.componentUrl} title={title} />
      )}

      {caseData.type === "gallery" && (
        <GalleryCaseView
          title={title}
          description={description}
          images={caseData.images}
          layout={caseData.galleryLayout}
        />
      )}
    </main>
  );
}
