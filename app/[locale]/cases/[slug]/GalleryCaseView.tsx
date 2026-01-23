"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import type { GalleryLayout, HighlightCard } from "@/types";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/ui/RichText";

interface GalleryCaseViewProps {
  title: string;
  description?: string;
  images: string[];
  layout?: GalleryLayout;
  highlights?: HighlightCard[];
  highlightFooter?: string;
  locale?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

// Проверяем, есть ли заполненные хайлайты
const hasHighlights = (highlights?: HighlightCard[]) => {
  if (!highlights || highlights.length === 0) return false;
  return highlights.some(h => h.title.trim() || h.description.trim());
};

export const GalleryCaseView = ({
  title,
  description,
  images,
  layout = "stack",
  highlights,
  highlightFooter,
  locale = "ru"
}: GalleryCaseViewProps) => {
  const showHighlights = hasHighlights(highlights);
  const isEnglish = locale === "en";

  return (
    <motion.div
      className="pb-16 min-h-screen"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Текстовый блок */}
      <div className="mx-auto mb-16 px-4 pt-[240px] max-w-[860px]">
        <motion.h1
          className="font-bold text-[50px] leading-[54px]"
          variants={itemVariants}
        >
          {title}
        </motion.h1>
        {description && description.trim() && (
          <motion.div
            className="mt-[18px]"
            variants={itemVariants}
          >
            <RichText content={description} />
          </motion.div>
        )}
      </div>

      {/* Блок инфографики (хайлайты) */}
      {showHighlights && highlights && (
        <div className="mx-auto px-4 max-w-[860px]">
          {/* Заголовок "Хайлайты" */}
          <motion.h2
            className="mb-[32px] font-medium text-[28px] leading-[35px]"
            style={{ color: "#9C9C9C", marginTop: "52px" }}
            variants={itemVariants}
          >
            {isEnglish ? "Highlights" : "Хайлайты"}
          </motion.h2>

          {/* Сетка карточек */}
          <div className="flex flex-col gap-[32px]">
            {/* Карточка 1 - во всю ширину */}
            {highlights[0] && (highlights[0].title || highlights[0].description) && (
              <motion.div
                className="border rounded-[24px]"
                style={{
                  borderColor: "#272727",
                  borderWidth: "3px",
                  padding: "36px 40px",
                  boxShadow: "inset 0 0 30px rgba(255, 255, 255, 0.08)"
                }}
                variants={itemVariants}
              >
                <p className="font-medium text-[28px] leading-[35px]" style={{ color: "#9C9C9C" }}>
                  {highlights[0].title}
                </p>
                {highlights[0].description && (
                  <p className="mt-[20px] font-medium text-[28px] leading-[35px]" style={{ color: "#FFFFFF" }}>
                    {highlights[0].description}
                  </p>
                )}
              </motion.div>
            )}

            {/* Карточки 2 и 3 - по половине ширины */}
            <div className="gap-[32px] grid grid-cols-1 md:grid-cols-2">
              {highlights[1] && (highlights[1].title || highlights[1].description) && (
                <motion.div
                  className="border rounded-[24px]"
                  style={{
                    borderColor: "#272727",
                    borderWidth: "3px",
                    padding: "36px 40px",
                    boxShadow: "inset 0 0 30px rgba(255, 255, 255, 0.08)"
                  }}
                  variants={itemVariants}
                >
                  <p className="font-medium text-[28px] leading-[35px]" style={{ color: "#9C9C9C" }}>
                    {highlights[1].title}
                  </p>
                  {highlights[1].description && (
                    <p className="mt-[20px] font-medium text-[28px] leading-[35px]" style={{ color: "#FFFFFF" }}>
                      {highlights[1].description}
                    </p>
                  )}
                </motion.div>
              )}
              {highlights[2] && (highlights[2].title || highlights[2].description) && (
                <motion.div
                  className="border rounded-[24px]"
                  style={{
                    borderColor: "#272727",
                    borderWidth: "3px",
                    padding: "36px 40px",
                    boxShadow: "inset 0 0 32px rgba(255, 255, 255, 0.08)"
                  }}
                  variants={itemVariants}
                >
                  <p className="font-medium text-[28px] leading-[35px]" style={{ color: "#9C9C9C" }}>
                    {highlights[2].title}
                  </p>
                  {highlights[2].description && (
                    <p className="mt-[20px] font-medium text-[28px] leading-[35px]" style={{ color: "#FFFFFF" }}>
                      {highlights[2].description}
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Карточка 4 - во всю ширину */}
            {highlights[3] && (highlights[3].title || highlights[3].description) && (
              <motion.div
                className="border rounded-[24px]"
                style={{
                  borderColor: "#272727",
                  borderWidth: "3px",
                  padding: "36px 40px",
                  boxShadow: "inset 0 0 30px rgba(255, 255, 255, 0.08)"
                }}
                variants={itemVariants}
              >
                <p className="font-medium text-[28px] leading-[35px]" style={{ color: "#9C9C9C" }}>
                  {highlights[3].title}
                </p>
                {highlights[3].description && (
                  <p className="mt-[20px] font-medium text-[28px] leading-[35px]" style={{ color: "#FFFFFF" }}>
                    {highlights[3].description}
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {/* Статичный текст под блоком */}
          <motion.p
            className="font-medium text-[28px] leading-[35px]"
            style={{
              color: "#9C9C9C",
              padding: "0 38px",
              marginTop: "68px",
              marginBottom: "68px"
            }}
            variants={itemVariants}
          >
            {highlightFooter || (isEnglish
              ? "\"Ready to discuss product strategy, metrics, and trade-offs in detail during an interview\""
              : "\"Готов детально разобрать продуктовую стратегию, метрики и trade-offs решений на интервью\"")
            }
          </motion.p>
        </div>
      )}

      {/* Галерея изображений */}
      {layout === "stack" ? (
        <StackGallery images={images} title={title} />
      ) : (
        <MasonryGallery images={images} title={title} />
      )}
    </motion.div>
  );
};

// Компонент картинки с Scale + Opacity эффектом при скролле
function ScaleOnScrollImage({
  image,
  title,
  index
}: {
  image: string;
  title: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.7"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.5, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className="rounded-2xl w-full overflow-hidden origin-center"
    >
      <Image
        src={image}
        alt={`${title} - изображение ${index + 1}`}
        width={1920}
        height={1080}
        className="w-full h-auto"
        sizes="(max-width: 768px) 100vw, calc(100vw - 128px)"
      />
    </motion.div>
  );
}

// Стек - картинки друг под другом с Scale + Opacity эффектом
function StackGallery({ images, title }: { images: string[]; title: string }) {
  return (
    <div className="flex flex-col gap-8 px-4 md:px-16">
      {images.map((image, index) => (
        <ScaleOnScrollImage
          key={index}
          image={image}
          title={title}
          index={index}
        />
      ))}
    </div>
  );
}

// Masonry сетка - колонки с разной высотой
function MasonryGallery({ images, title }: { images: string[]; title: string }) {
  return (
    <motion.div
      className={cn(
        "px-4 md:px-8 lg:px-16",
        "columns-1 sm:columns-2 lg:columns-3",
        "gap-4 md:gap-6"
      )}
      variants={containerVariants}
    >
      {images.map((image, index) => (
        <motion.div
          key={index}
          className={cn(
            "mb-4 md:mb-6 break-inside-avoid",
            "overflow-hidden",
            "bg-transparent"
          )}
          variants={itemVariants}
        >
          <Image
            src={image}
            alt={`${title} - изображение ${index + 1}`}
            width={800}
            height={600}
            className="w-full h-auto"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
