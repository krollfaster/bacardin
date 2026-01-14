"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: "easeOut" as const,
    },
  },
} as const;

export const RecommendationLetterView = () => {
  const t = useTranslations("recommendationLetter");

  const paragraphs = t.raw("content.paragraphs") as string[];
  const bullets = t.raw("content.bullets") as string[];
  const closing = t("content.closing");

  return (
    <motion.div
      className="min-h-screen pb-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header (как в кейсах) */}
      <div className="max-w-[860px] mx-auto pt-[240px] px-4 mb-12">
        <motion.h1
          className="text-[50px] leading-[54px] font-bold"
          variants={itemVariants}
        >
          {t("title")}
        </motion.h1>
        <motion.p
          className="text-[28px] leading-[35px] mt-4 text-muted-foreground"
          variants={itemVariants}
        >
          {t("description")}
        </motion.p>
      </div>

      {/* Letter content */}
      <div className="max-w-[860px] mx-auto px-4">
        <motion.div variants={itemVariants} className="space-y-8">
          {paragraphs.map((p, idx) => (
            <p
              key={idx}
              className="text-[28px] leading-[36px] font-[500] text-muted-foreground"
            >
              {p}
            </p>
          ))}

          <ul className="list-disc pl-6 space-y-4">
            {bullets.map((b, idx) => (
              <li
                key={idx}
                className="text-[28px] leading-[36px] font-[500] text-muted-foreground"
              >
                {b}
              </li>
            ))}
          </ul>

          <p className="text-[28px] leading-[36px] font-[500] text-muted-foreground">
            {closing}
          </p>
        </motion.div>

        {/* Proof */}
        <motion.section variants={itemVariants} className="mt-14">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-[28px] leading-[36px] font-medium text-foreground">
                {t("proof.title")}
              </h2>
              <p className="text-[18px] leading-[24px] mt-2 text-muted-foreground">
                {t("proof.caption")}
              </p>
            </div>
            <Button asChild variant="secondary">
              <a href="/images/recommendation-letter.jpg" download>
                <Download />
                {t("proof.downloadJpg")}
              </a>
            </Button>
          </div>

          <div
            className="mt-6 rounded-2xl overflow-hidden bg-card shadow-[inset_0_0_18px_rgba(255,255,255,0.04)]"
            style={{ boxShadow: "inset 0 0 18px rgba(255, 255, 255, 0.04)" }}
          >
            <Image
              src="/images/recommendation-letter.jpg"
              alt={t("proof.imageAlt")}
              width={1600}
              height={1000}
              className="w-full h-auto"
              sizes="(max-width: 768px) 100vw, 760px"
              priority
            />
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

