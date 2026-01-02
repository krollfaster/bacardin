"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { fadeIn, slideUp } from "@/lib/animations";

export const Hero = () => {
  const t = useTranslations("hero");

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="pt-24 md:pt-56"
    >
      <div className="mx-auto px-6 max-w-[1000px]">
        {/* Аватарка / Видео */}
        <motion.div
          variants={slideUp}
          className="mb-9"
        >
          <div className="w-[300px] h-[240px] rounded-2xl overflow-hidden">
            <video
              src="/ava.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Имя и статус */}
        <motion.div
          variants={slideUp}
          className="mb-4.5"
        >
          <h1 className="text-[50px] leading-[1.1] font-medium">
            <span className="text-foreground">{t("name")}</span>
            {" "}
            <span className="text-[#afce90]">{t("status")}</span>
          </h1>
        </motion.div>

        {/* Описание */}
        <motion.div
          variants={slideUp}
        >
          <p className="text-[50px] leading-[1.1] font-medium text-muted-foreground">
            {t("description")}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};
