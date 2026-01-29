import type { Metadata } from "next";
import { CaseNavigation } from "@/components/layout/CaseNavigation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { RecommendationLetterView } from "./RecommendationLetterView";

interface RecommendationLetterPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: RecommendationLetterPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isRu = locale === "ru";

  return {
    title: isRu ? "Рекомендательное письмо" : "Recommendation Letter",
    description: isRu
      ? "Рекомендательное письмо от Дениса Большакова, Дизайн лида СБЕР"
      : "Recommendation letter from Denis Bolshakov, Design Lead at SBER",
    alternates: {
      canonical: `/${locale}/recommendation-letter`,
      languages: {
        ru: "/ru/recommendation-letter",
        en: "/en/recommendation-letter",
      },
    },
  };
}

export default function RecommendationLetterPage() {

  return (
    <main className="bg-background min-h-screen">
      <CaseNavigation />

      <div className="right-6 bottom-6 z-50 fixed">
        <LanguageSwitcher />
      </div>

      <RecommendationLetterView />
    </main>
  );
}

