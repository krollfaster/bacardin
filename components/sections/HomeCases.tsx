"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { CaseCard } from "@/components/ui/CaseCard";
import type { Case } from "@/types";

interface HomeCasesProps {
  cases: Case[];
  locale: string;
}

export const HomeCases = ({ cases, locale }: HomeCasesProps) => {
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
          className="text-[28px] leading-[36px] font-medium text-muted-foreground mb-8"
        >
          {t("title")}
        </motion.h2>

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

      </div>
    </motion.section>
  );
};
