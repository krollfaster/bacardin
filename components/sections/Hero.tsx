"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { fadeIn, slideUp } from "@/lib/animations";

export const Hero = () => {
  const t = useTranslations("hero");

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="pt-[90px] md:pt-[211px]"
    >
      <div className="mx-auto px-6 max-w-[1000px]">
        {/* Аватарка */}
        <motion.div
          variants={slideUp}
          className="mb-[44px]"
        >
          <div className="rounded-2xl w-[330px] h-[330px] overflow-hidden relative">
            <Image
              src="/images/avatar.png"
              alt={t("name")}
              width={330}
              height={330}
              priority
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Имя и статус */}
        <motion.div
          variants={slideUp}
          className="mb-4.5"
        >
          <h1 className="font-medium text-[47px] leading-[1.1]">
            <span className="text-foreground">{t("name")}</span>
            {" "}
            <span className="text-[#AFCE90]">{t("status")}</span>
          </h1>
        </motion.div>

        {/* Описание */}
        <motion.div
          variants={slideUp}
        >
          <p className="font-medium text-[47px] text-muted-foreground leading-[1.1]">
            {t("description")}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};
