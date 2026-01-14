"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { staggerItem, cardHover, cardTap } from "@/lib/animations";
import { useHoverSound } from "@/hooks/useHoverSound";
import type { Case } from "@/types";

interface CaseCardProps {
  caseItem: Case;
  locale: string;
  uiElementLabel?: string;
}

export const CaseCard = ({ caseItem, locale, uiElementLabel }: CaseCardProps) => {
  const { playHoverSound } = useHoverSound();

  return (
    <motion.div
      variants={staggerItem}
      whileHover={cardHover}
      whileTap={cardTap}
      onHoverStart={playHoverSound}
    >
      <Link href={`/${locale}/cases/${caseItem.slug}`}>
        <article 
          className="h-[380px] rounded-[28px] p-3 flex flex-col gap-3 cursor-pointer group transition-colors duration-300 bg-[#1F1C18] hover:bg-[#413D38]"
        >
          {/* Блок с превью картинкой */}
          <div 
            className="flex-1 rounded-2xl overflow-hidden relative"
            style={{ backgroundColor: "#16130F" }}
          >
            {caseItem.coverImage ? (
              <Image
                src={caseItem.coverImage}
                alt={caseItem.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground">No image</span>
              </div>
            )}
            {/* Overlay для внутренней тени поверх изображения */}
            <div 
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{ boxShadow: "inset 0 0 50px rgba(255,255,255,0.03)" }}
            />
          </div>

          {/* Блок с текстом */}
          <div 
            className="h-[54px] rounded-2xl px-5 flex items-center justify-between"
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
  );
};

