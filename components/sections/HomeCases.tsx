"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { CaseCard } from "@/components/ui/CaseCard";
import { AllCasesButton } from "@/components/ui/AllCasesButton";
import type { Case } from "@/types";

interface HomeCasesProps {
  cases: Case[];
  locale: string;
  totalCasesCount: number;
}

export const HomeCases = ({ cases, locale, totalCasesCount }: HomeCasesProps) => {
  const t = useTranslations("cases");

  // Если нет кейсов для отображения, не рендерим секцию
  if (cases.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className="mt-[52px]"
    >
      <div className="mx-auto px-6 max-w-[1000px]">
        {/* Заголовок секции */}
        <motion.div
          variants={fadeIn}
          className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-8"
        >
          <h2 className="text-[28px] leading-[36px] font-medium text-muted-foreground">
            {t("title")}
          </h2>
          <span className="text-[28px] leading-[36px] font-medium text-muted-foreground/40">
            {t("hint")}
          </span>
        </motion.div>

        {/* Сетка кейсов */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={staggerContainer}
        >
          {cases.map((caseItem) => (
            <CaseCard 
              key={caseItem.id} 
              caseItem={caseItem} 
              locale={locale}
              uiElementLabel={t("uiElement")}
            />
          ))}
        </motion.div>

        {/* Кнопка перехода ко всем кейсам */}
        <AllCasesButton 
          locale={locale}
          totalCount={totalCasesCount}
          label={t("vibecodeCases")}
        />
      </div>
    </motion.section>
  );
};
