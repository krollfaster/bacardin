"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronsLeftRight } from "lucide-react";
import type { CasePreviewItem, PreviewImage } from "@/types";

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
  const isComparison = item.variant === "comparison";

  // Для режима сравнения по умолчанию активно "После" (индекс 1)
  const [activeIndex, setActiveIndex] = useState(() =>
    isComparison && images.length > 1 ? 1 : 0
  );

  // Синхронизация при смене режима
  useEffect(() => {
    if (isComparison && images.length > 1) {
      setActiveIndex(1);
    } else {
      setActiveIndex(0);
    }
  }, [item.variant, images.length]);

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

  const activeColor = accentColor || "#F99B7D";
  const activeImage = images[activeIndex] || images[0];

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
              const fallbackLabel = isComparison
                ? idx === 0
                  ? "До"
                  : "После"
                : `${idx + 1}`;
              const label = img.title && img.title.trim() ? img.title : fallbackLabel;

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

      {/* Область отображения картинки */}
      {isComparison && images.length >= 2 ? (
        <CaseComparisonSlider
          beforeImage={images[0]}
          afterImage={images[1]}
          activeIndex={activeIndex}
          accentColor={activeColor}
          title={item.title}
        />
      ) : item.variant === "slideshow" ? (
        /* Режим "Гифка": мгновенное переключение без фейдов и без схлопывания высоты */
        <div className="relative w-full overflow-hidden">
          {images.map((img, idx) => (
            <img
              key={img.id || `${img.url}-${idx}`}
              src={img.url}
              alt={img.title || item.title || "Preview image"}
              className={cn(
                "w-full h-auto object-contain select-none",
                idx === activeIndex
                  ? "relative block"
                  : "absolute inset-0 invisible pointer-events-none"
              )}
              loading="eager"
            />
          ))}
        </div>
      ) : (
        /* Режим табов: прямое отображение активной картинки */
        <div className="relative w-full overflow-hidden">
          <img
            src={activeImage.url}
            alt={activeImage.title || item.title || "Preview image"}
            className="w-full h-auto object-contain select-none block"
          />
        </div>
      )}
    </motion.div>
  );
};

// Интерактивный слайдер сравнения "До" и "После"
interface CaseComparisonSliderProps {
  beforeImage: PreviewImage;
  afterImage: PreviewImage;
  activeIndex: number;
  accentColor: string;
  title?: string;
}

function CaseComparisonSlider({
  beforeImage,
  afterImage,
  activeIndex,
  accentColor,
  title,
}: CaseComparisonSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [sliderPos, setSliderPos] = useState(50); // Процент разреза: 0..100

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.round((x / rect.width) * 1000) / 10;
    setSliderPos(percent);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updatePosition(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches[0]) {
      updatePosition(e.touches[0].clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      onTouchStart={() => setIsHovering(true)}
      onTouchEnd={() => setIsHovering(false)}
      onTouchMove={handleTouchMove}
      className="relative w-full overflow-hidden select-none cursor-ew-resize rounded-xl group"
    >
      {/* 1. Базовый слой: картинка "До" (видна слева от разреза) */}
      <img
        src={beforeImage.url}
        alt={beforeImage.title || `${title || "Кейс"} - До`}
        className="w-full h-auto object-contain select-none pointer-events-none block"
      />

      {/* 2. Верхний слой: картинка "После" (видна справа от разреза) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden transition-opacity duration-200"
        style={{
          clipPath: isHovering
            ? `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`
            : undefined,
          opacity: isHovering ? 1 : activeIndex === 1 ? 1 : 0,
        }}
      >
        <img
          src={afterImage.url}
          alt={afterImage.title || `${title || "Кейс"} - После`}
          className="w-full h-full object-contain select-none pointer-events-none block"
        />
      </div>

      {/* 3. Вертикальная разделительная линия и бегунок при наведении */}
      {isHovering && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-20 w-[2px] bg-white shadow-[0_0_14px_rgba(0,0,0,0.8)]"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Бегунок по центру */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-xl flex items-center justify-center border border-black/10 text-[#1A1A1A] transition-transform active:scale-95"
            style={{
              borderColor: accentColor,
            }}
          >
            <ChevronsLeftRight className="w-4 h-4 text-foreground" />
          </div>
        </div>
      )}

    </div>
  );
}
