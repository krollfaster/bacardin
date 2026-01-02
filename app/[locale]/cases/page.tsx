import { CasesHero } from "@/components/sections/CasesHero";
import { CasesList } from "@/components/sections/CasesList";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { getAllCases } from "@/lib/cases";

export default async function CasesPage() {
  const cases = await getAllCases();

  return (
    <main className="min-h-screen">
      {/* Переключатель языка */}
      <div className="fixed top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>
      <CasesHero />
      <CasesList cases={cases} />
    </main>
  );
}

