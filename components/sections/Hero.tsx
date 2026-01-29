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
          <div className="rounded-2xl w-[300px] h-[240px] overflow-hidden">
            <video
              src="/ava.mp4"
              autoPlay
              loop
              muted
              playsInline
              width={300}
              height={240}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Имя и статус */}
        <motion.div
          variants={slideUp}
          className="mb-4.5"
        >
          <h1 className="font-medium text-[50px] leading-[1.1]">
            <span className="text-foreground">{t("name")}</span>
            {" "}
            <span className="text-[#afce90]">{t("status")}</span>
          </h1>
        </motion.div>

        {/* Описание */}
        <motion.div
          variants={slideUp}
        >
          <p className="font-medium text-[50px] text-muted-foreground leading-[1.1]">
            {t("description")}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};
