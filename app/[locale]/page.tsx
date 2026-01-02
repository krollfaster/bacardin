import { Hero } from "@/components/sections/Hero";
import { Achievements } from "@/components/sections/Achievements";
import { Experience } from "@/components/sections/Experience";
import { Tags } from "@/components/sections/Tags";
import { Traits } from "@/components/sections/Traits";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Переключатель языка */}
      <div className="fixed top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>
      <Hero />
      <Achievements />
      <Experience />
      <Tags />
      <Traits />
    </main>
  );
}

