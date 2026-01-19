import { CasesHero } from "@/components/sections/CasesHero";
import { CasesList } from "@/components/sections/CasesList";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { CaseNavigation } from "@/components/layout/CaseNavigation";
import { getVibecodeCases } from "@/lib/cases";

export default async function CasesPage() {
  // Показываем только вайбкод кейсы
  const vibecodeCases = await getVibecodeCases();

  return (
    <main className="min-h-screen">
      {/* Навигация с кнопкой назад */}
      <CaseNavigation />

      {/* Переключатель языка */}
      <div className="fixed bottom-6 right-6 z-50">
        <LanguageSwitcher />
      </div>
      <CasesHero />
      <CasesList cases={vibecodeCases} />
    </main>
  );
}

