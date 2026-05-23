"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { LaurelIcon } from "@/components/ui/icons/LaurelIcon";
import { fadeIn, staggerContainer } from "@/lib/animations";

type TextPart = { type: "text"; value: string } | { type: "highlight"; value: string };

interface AchievementCardProps {
  parts: TextPart[];
  index: number;
}

const AchievementCard = ({ parts, index }: AchievementCardProps) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay: index * 0.1, duration: 0.5 },
        },
      }}
      className="bg-card px-10 pt-9 pb-[38px] rounded-4xl"
      style={{ boxShadow: 'inset 0 0 18px rgba(255, 255, 255, 0.04)' }}
    >
      <LaurelIcon size={64} className="mb-4" />
      <p className="font-[500] text-[28px] text-muted-foreground leading-[36px]">
        {parts.map((part, i) => (
          <span key={i}>
            {part.type === "highlight" ? (
              <span className="text-foreground">{part.value}</span>
            ) : (
              part.value
            )}
            {i < parts.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
    </motion.div>
  );
};

export const Achievements = () => {
  const t = useTranslations("achievements");

  const strengths: TextPart[][] = [
    [
      { type: "text", value: t("items.card1.part1") },
      { type: "highlight", value: t("items.card1.highlight") },
      { type: "text", value: t("items.card1.part2") },
    ],
    [
      { type: "text", value: t("items.card2.part1") },
      { type: "highlight", value: t("items.card2.highlight") },
      { type: "text", value: t("items.card2.part2") },
    ],
  ];

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
          {t("title")}
        </motion.h2>

        {/* Сетка карточек */}
        <div className="gap-6 md:gap-8 grid grid-cols-1 md:grid-cols-2">
          {strengths.map((parts, index) => (
            <AchievementCard key={index} parts={parts} index={index} />
          ))}
        </div>
      </div>
    </motion.section>
  );
};
