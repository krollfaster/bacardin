import { Hero } from "@/components/sections/Hero";
import { Achievements } from "@/components/sections/Achievements";
import { Experience } from "@/components/sections/Experience";
import { HomeCases } from "@/components/sections/HomeCases";
import { Tags } from "@/components/sections/Tags";
import { Traits } from "@/components/sections/Traits";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { getFeaturedCases, getVibecodeCases } from "@/lib/cases";

interface HomePageProps {
  params: Promise<{ locale: string }>;
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
      <div className="fixed bottom-6 right-6 z-50">
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
      <Traits />
    </main>
  );
}
