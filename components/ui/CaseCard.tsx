"use client";

import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { staggerItem } from "@/lib/animations";
import { useHoverSound } from "@/hooks/useHoverSound";
import type { Case } from "@/types";
import { MouseEvent, useState } from "react";

interface CaseCardProps {
  caseItem: Case;
  locale: string;
  uiElementLabel?: string;
}

export const CaseCard = ({ caseItem, locale, uiElementLabel }: CaseCardProps) => {
  const { playHoverSound } = useHoverSound();
  const [isHovering, setIsHovering] = useState(false);

  // Motion values для отслеживания позиции курсора (0-1)
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Позиция курсора в пикселях для градиента
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 3D наклон карточки
  const rotateX = useSpring(useTransform(y, [0, 1], [10, -10]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [0, 1], [-10, 10]), {
    stiffness: 300,
    damping: 30,
  });

  // Parallax смещение изображения
  const imageX = useSpring(useTransform(x, [0, 1], [-20, 20]), {
    stiffness: 200,
    damping: 25,
  });
  const imageY = useSpring(useTransform(y, [0, 1], [-20, 20]), {
    stiffness: 200,
    damping: 25,
  });

  // Градиент spotlight, следующий за курсором
  const spotlightBackground = useMotionTemplate`
    radial-gradient(
      500px circle at ${mouseX}px ${mouseY}px,
      rgba(255, 255, 255, 0.22),
      transparent 70%
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
      variants={staggerItem}
      onHoverStart={playHoverSound}
      style={{ perspective: 1000 }}
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
        <Link href={`/${locale}/cases/${caseItem.slug}`}>
          <article 
            className="relative h-[380px] rounded-[28px] p-3 flex flex-col gap-3 cursor-pointer group bg-[#1F1C18] overflow-hidden"
          >
            {/* Spotlight gradient overlay */}
            <motion.div
              className="absolute inset-0 rounded-[28px] pointer-events-none z-0 transition-opacity duration-300"
              style={{ 
                background: spotlightBackground,
                opacity: isHovering ? 1 : 0,
              }}
            />
            {/* Блок с превью картинкой */}
            <div 
              className="flex-1 rounded-2xl overflow-hidden relative z-10"
              style={{ backgroundColor: "#16130F" }}
            >
              {caseItem.coverImage ? (
                <motion.div
                  style={{ x: imageX, y: imageY }}
                  className="absolute inset-[-20px]"
                >
                  <Image
                    src={caseItem.coverImage}
                    alt={caseItem.title}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
              {/* Overlay для внутренней тени поверх изображения */}
              <div 
                className="absolute inset-0 pointer-events-none rounded-2xl z-10"
                style={{ boxShadow: "inset 0 0 50px rgba(255,255,255,0.03)" }}
              />
            </div>

            {/* Блок с текстом */}
            <div 
              className="h-[54px] rounded-2xl px-5 flex items-center justify-between z-10"
              style={{ 
                backgroundColor: "#16130F",
                boxShadow: "inset 0 0 50px rgba(255,255,255,0.03)"
              }}
            >
              <span className="text-lg font-medium text-foreground truncate">
                {caseItem.title}
              </span>
              <span className="text-lg text-muted-foreground whitespace-nowrap ml-4">
                {caseItem.type === "component" 
                  ? (uiElementLabel || "UI Element")
                  : (caseItem.tags && caseItem.tags.length > 0 ? caseItem.tags.join(", ") : null)
                }
              </span>
            </div>
          </article>
        </Link>
      </motion.div>
    </motion.div>
  );
};

