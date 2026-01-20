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
        <motion.h2
          variants={fadeIn}
          className="mb-8 font-medium text-[28px] text-muted-foreground leading-[36px]"
        >
          {t("title")} <span className="text-white">({t("hint")})</span>
        </motion.h2>

        {/* Сетка кейсов */}
        <motion.div
          className="gap-6 grid grid-cols-1 md:grid-cols-2"
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
