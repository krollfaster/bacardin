import type { Metadata } from "next";
import { CasesHero } from "@/components/sections/CasesHero";
import { CasesList } from "@/components/sections/CasesList";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { CaseNavigation } from "@/components/layout/CaseNavigation";
import { getVibecodeCases } from "@/lib/cases";

interface CasesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: CasesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isRu = locale === "ru";

  return {
    title: isRu ? "Vibecode Кейсы" : "Vibecode Cases",
    description: isRu
      ? "Интерактивные UI элементы и анимации, созданные с помощью кода"
      : "Interactive UI elements and animations created with code",
    alternates: {
      canonical: `/${locale}/cases`,
      languages: { ru: "/ru/cases", en: "/en/cases" },
    },
  };
}

export default async function CasesPage({ params }: CasesPageProps) {
  const { locale } = await params;

  // Показываем только вайбкод кейсы
  const vibecodeCases = await getVibecodeCases();

  return (
    <main className="min-h-screen">
      {/* Навигация с кнопкой назад */}
      <CaseNavigation />

      {/* Переключатель языка */}
      <div className="right-6 bottom-6 z-50 fixed">
        <LanguageSwitcher />
      </div>
      <CasesHero />
      <CasesList cases={vibecodeCases} />
    </main>
  );
}

