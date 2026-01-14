import { CaseNavigation } from "@/components/layout/CaseNavigation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { RecommendationLetterView } from "./RecommendationLetterView";

export default function RecommendationLetterPage() {
  return (
    <main className="min-h-screen bg-background">
      <CaseNavigation />

      <div className="fixed bottom-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      <RecommendationLetterView />
    </main>
  );
}

