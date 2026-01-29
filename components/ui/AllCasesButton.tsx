"use client";

import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { fadeIn } from "@/lib/animations";
import { useHoverSound } from "@/hooks/useHoverSound";
import { MouseEvent, useState } from "react";

interface AllCasesButtonProps {
  locale: string;
  totalCount: number;
  label: string;
}

export const AllCasesButton = ({ locale, totalCount, label }: AllCasesButtonProps) => {
  const { playHoverSound } = useHoverSound();
  const [isHovering, setIsHovering] = useState(false);

  // Motion values для отслеживания позиции курсора (0-1)
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Позиция курсора в пикселях для градиента
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 3D наклон карточки
  const rotateX = useSpring(useTransform(y, [0, 1], [8, -8]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [0, 1], [-8, 8]), {
    stiffness: 300,
    damping: 30,
  });

  // Радужный градиент spotlight, следующий за курсором (эллипс под углом)
  const rainbowSpotlightBackground = useMotionTemplate`
    radial-gradient(
      500px 500px at ${mouseX}px ${mouseY}px,
      rgba(255, 80, 80, 0.4),
      rgba(255, 180, 50, 0.4) 20%,
      rgba(50, 255, 120, 0.4) 40%,
      rgba(50, 180, 255, 0.40) 60%,
      rgba(180, 50, 255, 0.40) 80%,
      transparent 100%
    )
  `;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
    setIsHovering(false);
  };

  return (
    <motion.div
      variants={fadeIn}
      onHoverStart={playHoverSound}
      style={{ perspective: 1000 }}
      className="mt-6"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileTap={{ scale: 0.98 }}
      >
        <Link href={`/${locale}/cases`}>
          <div
            className="group relative bg-[#1F1C18] p-3 rounded-[28px] h-[128px] overflow-hidden cursor-pointer"
          >
            {/* Rainbow spotlight gradient overlay */}
            <motion.div
              className="z-0 absolute inset-0 rounded-[28px] transition-opacity duration-300 pointer-events-none"
              style={{
                background: rainbowSpotlightBackground,
                opacity: isHovering ? 1 : 0,
              }}
            />

            {/* Внутренний блок с контентом */}
            <div
              className="z-10 relative flex justify-between items-center px-9 rounded-2xl h-full"
              style={{
                backgroundColor: "#16130F",
                boxShadow: "inset 0 0 50px rgba(255,255,255,0.03)"
              }}
            >
              {/* Левая часть: иконка + текст */}
              <div className="flex items-center gap-4">
                {/* Иконка скрыта на мобильных */}
                <Image
                  src="/images/icons/code.svg"
                  alt="Vibecode кейсы"
                  width={54}
                  height={54}
                  className="hidden md:block flex-shrink-0"
                />
                {/* Полный текст на десктопе, короткий на мобильных */}
                <span
                  className="hidden md:inline font-medium text-[50px] text-muted-foreground leading-[54px]"
                >
                  {label}
                </span>
                <span
                  className="md:hidden font-medium text-[50px] text-muted-foreground leading-[54px]"
                >
                  Vibecode
                </span>
              </div>

              {/* Правая часть: количество */}
              <span
                className="font-medium text-[50px] text-muted-foreground/50 leading-[54px]"
              >
                ({totalCount})
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
};
