"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useTranslations } from "next-intl";
import { MouseEvent, useState } from "react";
import { useHoverSound } from "@/hooks/useHoverSound";
import { fadeIn, staggerContainer } from "@/lib/animations";

export const TelegramCTA = () => {
  const t = useTranslations("common");
  const { playHoverSound } = useHoverSound();
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Градиент spotlight, следующий за положением мышки
  const spotlightBackground = useMotionTemplate`
    radial-gradient(
      600px circle at ${mouseX}px ${mouseY}px,
      rgba(255, 255, 255, 0.16),
      transparent 65%
    )
  `;

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className="mt-[40px] mb-[286px]"
    >
      <div className="mx-auto px-6 max-w-[1000px]">
        <motion.a
          href="https://t.me/RickBacardin"
          target="_blank"
          rel="noopener noreferrer"
          variants={fadeIn}
          onHoverStart={playHoverSound}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
          whileTap={{ scale: 0.99 }}
          className="relative w-full h-[107px] rounded-[24px] flex items-center justify-center overflow-hidden cursor-pointer select-none transition-colors"
          style={{
            backgroundColor: "#1F1C18",
          }}
        >
          {/* Spotlight слой при наведении */}
          <motion.div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              background: spotlightBackground,
              opacity: isHovering ? 1 : 0,
            }}
          />

          {/* Текст кнопки */}
          <span className="relative z-10 font-medium text-[24px] sm:text-[32px] md:text-[50px] leading-[1] text-white tracking-tight text-center px-4">
            {t("writeToTg")}
          </span>
        </motion.a>
      </div>
    </motion.section>
  );
};
