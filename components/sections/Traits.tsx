"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { fadeIn, staggerContainer } from "@/lib/animations";

interface TraitItem {
  title: string;
  text: string;
}

const Trait = ({ title, text, index }: TraitItem & { index: number }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay: index * 0.1, duration: 0.4 },
        },
      }}
      className="flex flex-col gap-1"
    >
      <h3 className="text-[28px] leading-[36px] font-[500] text-foreground">
        {title}
      </h3>
      <p className="text-[28px] leading-[36px] font-[500] text-muted-foreground">
        {text}
      </p>
    </motion.div>
  );
};

export const Traits = () => {
  const t = useTranslations("traits");
  const items = t.raw("items") as TraitItem[];

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

        {/* Карточка с чертами */}
        <motion.div
          variants={fadeIn}
          className="rounded-4xl bg-card px-10 pb-[38px] pt-9"
          style={{ boxShadow: "inset 0 0 18px rgba(255, 255, 255, 0.04)" }}
        >
          <div className="flex flex-col gap-[26px]">
            {items.map((item, index) => (
              <Trait
                key={index}
                title={item.title}
                text={item.text}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

