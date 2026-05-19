"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
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
          className="rounded-[24px]"
          style={{
            border: "3px solid #272727",
            padding: "36px 40px",
            boxShadow: "inset 0 0 30px rgba(255, 255, 255, 0.08)",
          }}
        >
          <p
            className="font-medium text-[28px] leading-[35px]"
            style={{ color: "#9C9C9C" }}
          >
            {t("description")}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};
