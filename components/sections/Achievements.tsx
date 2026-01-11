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
      className="rounded-4xl bg-card px-10 pb-[38px] pt-9"
      style={{ boxShadow: 'inset 0 0 18px rgba(255, 255, 255, 0.04)' }}
    >
      <LaurelIcon size={64} className="mb-4" />
      <p className="text-[28px] leading-[38px] font-[500] text-muted-foreground">
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

  const achievements: TextPart[][] = [
    [
      { type: "text", value: t("items.okr_part1") },
      { type: "highlight", value: t("items.okr_highlight1") },
      { type: "text", value: t("items.okr_part2") },
      { type: "highlight", value: t("items.okr_highlight2") },
      { type: "text", value: t("items.okr_part3") },
    ],
    [
      { type: "text", value: t("items.redesign_part1") },
      { type: "highlight", value: t("items.redesign_highlight1") },
      { type: "text", value: t("items.redesign_part2") },
      { type: "highlight", value: t("items.redesign_highlight2") },
    ],
    [
      { type: "text", value: t("items.agile_part1") },
      { type: "highlight", value: t("items.agile_highlight1") },
      { type: "text", value: t("items.agile_part2") },
      { type: "highlight", value: t("items.agile_highlight2") },
    ],
    [
      { type: "text", value: t("items.ai_part1") },
      { type: "highlight", value: t("items.ai_highlight1") },
      { type: "text", value: t("items.ai_part2") },
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
          className="text-[28px] leading-[36px] font-medium text-muted-foreground mb-8"
        >
          {t("title")}
        </motion.h2>

        {/* Сетка карточек */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {achievements.map((parts, index) => (
            <AchievementCard key={index} parts={parts} index={index} />
          ))}
        </div>
      </div>
    </motion.section>
  );
};
