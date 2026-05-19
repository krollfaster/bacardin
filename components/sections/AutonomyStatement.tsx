"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { fadeIn } from "@/lib/animations";

export const AutonomyStatement = () => {
  const t = useTranslations("autonomy");

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="mt-[52px] mb-20"
    >
      <div className="mx-auto px-6 max-w-[1000px]">
        <motion.div
          variants={fadeIn}
          className="bg-card px-10 pt-9 pb-[38px] rounded-4xl"
          style={{ boxShadow: "inset 0 0 18px rgba(255, 255, 255, 0.04)" }}
        >
          {/* Icon + Heading Row */}
          <div className="flex items-center gap-4 mb-6">
            <Sparkles size={32} className="text-[#afce90] flex-shrink-0" />
            <h2 className="font-medium text-[28px] text-foreground leading-[36px]">
              {t("title")}
            </h2>
          </div>

          {/* Description */}
          <p className="font-[500] text-[20px] text-muted-foreground leading-[32px]">
            {t("description")}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};
