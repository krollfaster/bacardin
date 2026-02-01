"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import type { GalleryLayout, HighlightCard, InfoBlocks, InfoBlockCard, MetricsCard } from "@/types";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/ui/RichText";

interface GalleryCaseViewProps {
  title: string;
  description?: string;
  images: string[];
  layout?: GalleryLayout;
  highlights?: HighlightCard[]; // @deprecated
  highlightFooter?: string;
  infoBlocks?: InfoBlocks;
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

// Проверяем, есть ли заполненные хайлайты (legacy)
const hasHighlights = (highlights?: HighlightCard[]) => {
  if (!highlights || highlights.length === 0) return false;
  return highlights.some(h => h.title.trim() || h.description.trim());
};

// Проверяем, есть ли карточки в инфо-блоке
const hasCards = (cards?: InfoBlockCard[]) => {
  if (!cards || cards.length === 0) return false;
  return cards.some(c => c.title.trim() || c.description.trim());
};

// Названия блоков для RU/EN
const blockTitles = {
  role: { ru: "Контекст", en: "Context" },
  strategy: { ru: "Действия", en: "Actions" },
  cases: { ru: "Влияние", en: "Impact" },
  metrics: { ru: "Метрики", en: "Metrics" },
} as const;

// Компонент для рендеринга инфо-блока
interface InfoBlockSectionProps {
  blockKey: keyof typeof blockTitles;
  cards: InfoBlockCard[];
  isEnglish: boolean;
}

function InfoBlockSection({ blockKey, cards, isEnglish }: InfoBlockSectionProps) {
  // Фильтруем только заполненные карточки
  const filledCards = cards.filter(c => c.title.trim() || c.description.trim());
  if (filledCards.length === 0) return null;

  // Группируем карточки в ряды для правильного рендеринга
  const rows: InfoBlockCard[][] = [];
  let currentRow: InfoBlockCard[] = [];

  filledCards.forEach((card, index) => {
    const isLastCard = index === filledCards.length - 1;

    if (card.fullWidth) {
      // Если текущий ряд не пустой, сохраняем его
      if (currentRow.length > 0) {
        rows.push(currentRow);
        currentRow = [];
      }
      // Карточка на всю ширину — отдельный ряд
      rows.push([card]);
    } else {
      currentRow.push(card);
      // Если в ряду 2 карточки или это последняя карточка — сохраняем ряд
      if (currentRow.length === 2 || isLastCard) {
        rows.push(currentRow);
        currentRow = [];
      }
    }
  });

  const title = isEnglish ? blockTitles[blockKey].en : blockTitles[blockKey].ru;

  return (
    <div className="mt-[52px]">
      {/* Заголовок блока */}
      <motion.h2
        className="mb-[32px] font-medium text-[28px] leading-[35px]"
        style={{ color: "#9C9C9C" }}
        variants={itemVariants}
      >
        {title}
      </motion.h2>

      {/* Ряды карточек */}
      <div className="flex flex-col gap-[32px]">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={cn(
              "gap-[32px] grid",
              // Если в ряду 1 карточка — на всю ширину, иначе 2 колонки
              row.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
            )}
          >
            {row.map((card, cardIndex) => (
              <motion.div
                key={cardIndex}
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
                  {card.title}
                </p>
                {card.description && (
                  <p className="mt-[20px] font-medium text-[28px] leading-[35px]" style={{ color: "#FFFFFF" }}>
                    {card.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Проверяем, есть ли карточки в блоке метрик
const hasMetricsCards = (cards?: MetricsCard[]) => {
  if (!cards || cards.length === 0) return false;
  return cards.some(c => c.description.trim());
};

// Компонент для рендеринга блока метрик (3 колонки, только описание)
interface MetricsBlockSectionProps {
  cards: MetricsCard[];
  isEnglish: boolean;
}

function MetricsBlockSection({ cards, isEnglish }: MetricsBlockSectionProps) {
  // Фильтруем только заполненные карточки
  const filledCards = cards.filter(c => c.description.trim());
  if (filledCards.length === 0) return null;

  const title = isEnglish ? blockTitles.metrics.en : blockTitles.metrics.ru;

  return (
    <div className="mt-[52px]">
      {/* Заголовок блока */}
      <motion.h2
        className="mb-[32px] font-medium text-[28px] leading-[35px]"
        style={{ color: "#9C9C9C" }}
        variants={itemVariants}
      >
        {title}
      </motion.h2>

      {/* Сетка карточек 3 колонки */}
      <div className="gap-[32px] grid grid-cols-3">
        {filledCards.map((card, index) => {
          const span = card.span || 1;
          return (
            <motion.div
              key={index}
              className={cn(
                "border rounded-[24px]",
                span === 1 && "col-span-1",
                span === 2 && "col-span-2",
                span === 3 && "col-span-3"
              )}
              style={{
                borderColor: "#272727",
                borderWidth: "3px",
                padding: "36px 40px",
                boxShadow: "inset 0 0 30px rgba(255, 255, 255, 0.08)"
              }}
              variants={itemVariants}
            >
              <p className="font-medium text-[28px] leading-[35px]" style={{ color: "#9C9C9C" }}>
                {card.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export const GalleryCaseView = ({
  title,
  description,
  images,
  layout = "stack",
  highlights,
  highlightFooter,
  infoBlocks,
  locale = "ru"
}: GalleryCaseViewProps) => {
  const showHighlights = hasHighlights(highlights);
  const isEnglish = locale === "en";

  // Проверяем, есть ли хотя бы один инфо-блок с карточками
  const hasAnyInfoBlock = infoBlocks && (
    hasCards(infoBlocks.role?.cards) ||
    hasCards(infoBlocks.strategy?.cards) ||
    hasCards(infoBlocks.cases?.cards) ||
    hasMetricsCards(infoBlocks.metrics?.cards)
  );

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

      {/* Новые инфо-блоки (Контекст, Действия, Влияние) */}
      {hasAnyInfoBlock && infoBlocks && (
        <div className="mx-auto px-4 max-w-[860px]">
          {/* Блок Контекст */}
          {infoBlocks.role?.cards && hasCards(infoBlocks.role.cards) && (
            <InfoBlockSection
              blockKey="role"
              cards={infoBlocks.role.cards}
              isEnglish={isEnglish}
            />
          )}

          {/* Блок Действия */}
          {infoBlocks.strategy?.cards && hasCards(infoBlocks.strategy.cards) && (
            <InfoBlockSection
              blockKey="strategy"
              cards={infoBlocks.strategy.cards}
              isEnglish={isEnglish}
            />
          )}

          {/* Блок Влияние */}
          {infoBlocks.cases?.cards && hasCards(infoBlocks.cases.cards) && (
            <InfoBlockSection
              blockKey="cases"
              cards={infoBlocks.cases.cards}
              isEnglish={isEnglish}
            />
          )}

          {/* Блок Метрики */}
          {infoBlocks.metrics?.cards && hasMetricsCards(infoBlocks.metrics.cards) && (
            <MetricsBlockSection
              cards={infoBlocks.metrics.cards}
              isEnglish={isEnglish}
            />
          )}
        </div>
      )}

      {/* Статичный текст под блоками — показывается всегда */}
      <div className="mx-auto px-4 max-w-[860px]">
        <motion.p
          className="font-medium text-[28px] text-center leading-[35px]"
          style={{
            color: "#9C9C9C",
            padding: "0 100px",
            marginTop: "176px",
            marginBottom: "176px"
          }}
          variants={itemVariants}
        >
          {highlightFooter || (isEnglish
            ? "\"Ready to discuss product strategy, metrics, and trade-offs in detail during an interview\""
            : "\"Готов детально разобрать продуктовую стратегию, метрики и trade-offs решений на интервью\""
          )}
        </motion.p>
      </div>

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
