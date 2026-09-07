"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CasePreviewItem } from "@/types";

interface CasePreviewProps {
  item: CasePreviewItem;
  accentColor?: string;
  variants?: Variants;
  className?: string;
}

export const CasePreview = ({
  item,
  accentColor,
  variants,
  className,
}: CasePreviewProps) => {
  const images = (item.images || []).filter((img) => img.url && img.url.trim());
  const [activeIndex, setActiveIndex] = useState(0);

  // Автопереключение для режима "slideshow" (гифка)
  useEffect(() => {
    if (item.variant !== "slideshow" || images.length <= 1) return;

    const intervalMs = (item.interval && item.interval > 0 ? item.interval : 3) * 1000;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [item.variant, item.interval, images.length]);

  if (images.length === 0) return null;

  const activeImage = images[activeIndex] || images[0];
  const activeColor = accentColor || "#F99B7D";

  return (
    <motion.div className={cn("w-full", className)} variants={variants}>
      {/* Верхняя строка: Заголовок слева + Табы справа */}
      <div className="flex justify-between items-baseline mt-[52px] mb-[32px]">
        {item.title ? (
          <h2
            className="font-medium text-[28px] leading-[36px]"
            style={{ color: "#9C9C9C" }}
          >
            {item.title}
          </h2>
        ) : (
          <div />
        )}

        {/* Табы переключения (если картинок больше 1) */}
        {images.length > 1 && (
          <div className="flex items-center gap-[24px]">
            {images.map((img, idx) => {
              const isActive = idx === activeIndex;
              const label = img.title && img.title.trim() ? img.title : `${idx + 1}`;

              return (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className="font-medium text-[28px] leading-[36px] transition-colors cursor-pointer select-none"
                  style={{
                    color: isActive ? activeColor : "#9C9C9C",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Область отображения картинки (чистый PNG без лишних рамок) */}
      <div className="relative w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage.id || `${activeImage.url}-${activeIndex}`}
            src={activeImage.url}
            alt={activeImage.title || item.title || "Preview image"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full h-auto object-contain select-none"
          />
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
