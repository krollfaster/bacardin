import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Achievements } from "@/components/sections/Achievements";
import { Experience } from "@/components/sections/Experience";
import { HomeCases } from "@/components/sections/HomeCases";
import { Tags } from "@/components/sections/Tags";
import { Testimonials } from "@/components/sections/Testimonials";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { getFeaturedCases, getVibecodeCases } from "@/lib/cases";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const isRu = locale === "ru";

  return {
    title: isRu
      ? "Эрнест фон Шульдайс — Lead Product Designer"
      : "Ernest von Shuldays — Lead Product Designer",
    description: isRu
      ? "Lead Product Designer. Редизайн B2E экосистемы для 25000+ сотрудников Сбербанка. NPS +6 п.п., CSI +2 пункта."
      : "Staff Product Designer. B2E ecosystem redesign for 25,000+ Sberbank employees. NPS +6 pp, CSI +2 points.",
    alternates: {
      canonical: `/${locale}`,
      languages: { ru: "/ru", en: "/en" },
    },
  };
}


export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const featuredCases = await getFeaturedCases();
  const vibecodeCases = await getVibecodeCases();
  // Считаем вайбкод кейсы для кнопки
  const vibecodeCasesCount = vibecodeCases.length;

  return (
    <main className="min-h-screen">
      {/* Переключатель языка */}
      <div className="right-6 bottom-6 z-50 fixed">
        <LanguageSwitcher />
      </div>
      <Hero />
      <Achievements />
      <Experience />
      <HomeCases
        cases={featuredCases}
        locale={locale}
        totalCasesCount={vibecodeCasesCount}
      />
      <Tags />
      <Testimonials />
    </main>
  );
}

