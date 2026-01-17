"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { fadeIn, slideUp } from "@/lib/animations";

export const CasesHero = () => {
  const t = useTranslations("casesPage");

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="pt-60"
    >
      <div className="mx-auto px-6 max-w-[1000px]">
        {/* Текст заголовка */}
        <motion.div variants={slideUp}>
          <p className="text-[50px] leading-[1.1] font-medium text-muted-foreground">
            {t("title")}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

