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
  const { slug } = await params;
  const caseData = await getCaseBySlug(slug);

  // Если кейс не найден или не опубликован - 404
  if (!caseData || !caseData.published) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <CaseNavigation />

      {caseData.type === "component" && caseData.componentUrl && (
        <ComponentCaseView componentUrl={caseData.componentUrl} title={caseData.title} />
      )}

      {caseData.type === "gallery" && (
        <GalleryCaseView
          title={caseData.title}
          description={caseData.description}
          images={caseData.images}
          layout={caseData.galleryLayout}
        />
      )}
    </main>
  );
}
