"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { staggerContainer } from "@/lib/animations";
import { CaseCard } from "@/components/ui/CaseCard";
import type { Case } from "@/types";

interface CasesListProps {
  cases: Case[];
}

export const CasesList = ({ cases }: CasesListProps) => {
  const t = useTranslations("casesPage");
  const locale = useLocale();
  
  const publishedCases = cases.filter((c) => c.published);

  if (publishedCases.length === 0) {
    return (
      <section className="pt-24">
        <div className="mx-auto px-6 max-w-[1000px]">
          <p className="text-muted-foreground text-center">
            {t("noCases")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="pt-24 pb-24"
    >
      <div className="mx-auto px-6 max-w-[1000px]">
        {/* Сетка кейсов */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={staggerContainer}
        >
          {publishedCases.map((caseItem) => (
            <CaseCard 
              key={caseItem.id} 
              caseItem={caseItem} 
              locale={locale} 
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};
