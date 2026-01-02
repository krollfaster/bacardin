"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { CaseCard } from "@/components/ui/CaseCard";
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
            />
          ))}
        </motion.div>

        {/* Кнопка "Show more" */}
        <motion.div
          variants={fadeIn}
          className="mt-8"
        >
          <Link
            href={`/${locale}/cases`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between h-[100px] rounded-[28px] px-8 transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#2B4151" }}
          >
            <Image
              src="/images/icons/arrow-right-long.svg"
              alt="Arrow"
              width={64}
              height={64}
              className="flex-shrink-0"
            />
            <span 
              className="text-[50px] font-medium"
              style={{ color: "#8BCBF7" }}
            >
              show more ({totalCasesCount})
            </span>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
};
