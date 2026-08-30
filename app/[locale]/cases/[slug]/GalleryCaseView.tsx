"use client";

import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate } from "framer-motion";
import Image from "next/image";
import { useRef, useState, MouseEvent } from "react";
import { useHoverSound } from "@/hooks/useHoverSound";
import type {
  GalleryLayout,
  HighlightCard,
  InfoBlocks,
  CaseItem,
  CaseHeadingItem,
  CaseCardItem,
  CaseMetricsItem,
} from "@/types";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/ui/RichText";

interface GalleryCaseViewProps {
  title: string;
  description?: string;
  logo?: string;
  images: string[];
  layout?: GalleryLayout;
  items?: CaseItem[];
  highlights?: HighlightCard[]; // @deprecated
  infoBlocks?: InfoBlocks; // @deprecated
  locale?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

type RenderSegment =
  | { type: "heading"; item: CaseHeadingItem }
  | { type: "metrics"; item: CaseMetricsItem }
  | { type: "card-group"; cards: CaseCardItem[] };

// Разбивка элементов на сегменты для правильного отображения рядов карточек
function segmentItems(items: CaseItem[]): RenderSegment[] {
  const segments: RenderSegment[] = [];
  let currentCardGroup: CaseCardItem[] = [];

  const flushCardGroup = () => {
    if (currentCardGroup.length > 0) {
      segments.push({ type: "card-group", cards: currentCardGroup });
      currentCardGroup = [];
    }
  };

  items.forEach((item) => {
    if (item.type === "heading") {
      flushCardGroup();
      if (item.title && item.title.trim()) {
        segments.push({ type: "heading", item });
      }
    } else if (item.type === "metrics") {
      flushCardGroup();
      const validCards = (item.cards || []).filter((c) => c.description && c.description.trim());
      if (validCards.length > 0) {
        segments.push({ type: "metrics", item: { ...item, cards: validCards } });
      }
    } else if (item.type === "card") {
      const isCardFilled = (item.title && item.title.trim()) || (item.description && item.description.trim());
      if (!isCardFilled) return;

      if (item.fullWidth) {
        flushCardGroup();
        segments.push({ type: "card-group", cards: [item] });
      } else {
        currentCardGroup.push(item);
        if (currentCardGroup.length === 2) {
          flushCardGroup();
        }
      }
    }
  });

  flushCardGroup();
  return segments;
}

// Fallback конвертер старых блоков в ленту
function buildFallbackItems(infoBlocks?: InfoBlocks, highlights?: HighlightCard[], isEnglish = false): CaseItem[] {
  const items: CaseItem[] = [];

  if (infoBlocks) {
    if (infoBlocks.role?.cards && infoBlocks.role.cards.length > 0) {
      items.push({
        id: "fb-role",
        type: "heading",
        title: isEnglish ? "Context" : "Контекст",
      });
      infoBlocks.role.cards.forEach((c, idx) => {
        items.push({
          id: `fb-role-${idx}`,
          type: "card",
          title: c.title,
          description: c.description,
          fullWidth: c.fullWidth ?? false,
        });
      });
    }

    if (infoBlocks.strategy?.cards && infoBlocks.strategy.cards.length > 0) {
      items.push({
        id: "fb-strat",
        type: "heading",
        title: isEnglish ? "Actions" : "Действия",
      });
      infoBlocks.strategy.cards.forEach((c, idx) => {
        items.push({
          id: `fb-strat-${idx}`,
          type: "card",
          title: c.title,
          description: c.description,
          fullWidth: c.fullWidth ?? false,
        });
      });
    }

    if (infoBlocks.cases?.cards && infoBlocks.cases.cards.length > 0) {
      items.push({
        id: "fb-cases",
        type: "heading",
        title: isEnglish ? "Impact" : "Влияние",
      });
      infoBlocks.cases.cards.forEach((c, idx) => {
        items.push({
          id: `fb-cases-${idx}`,
          type: "card",
          title: c.title,
          description: c.description,
          fullWidth: c.fullWidth ?? false,
        });
      });
    }

    if (infoBlocks.metrics?.cards && infoBlocks.metrics.cards.length > 0) {
      items.push({
        id: "fb-metrics-head",
        type: "heading",
        title: isEnglish ? "Metrics" : "Метрики",
      });
      items.push({
        id: "fb-metrics",
        type: "metrics",
        cards: infoBlocks.metrics.cards.map((m, idx) => ({
          id: `fb-m-${idx}`,
          description: m.description,
          span: m.span || 1,
        })),
      });
    }
  }

  if (items.length === 0 && highlights && highlights.length > 0) {
    const validHighlights = highlights.filter((h) => h.title.trim() || h.description.trim());
    if (validHighlights.length > 0) {
      items.push({
        id: "fb-hl-head",
        type: "heading",
        title: isEnglish ? "Case" : "Кейс",
      });
      validHighlights.forEach((h, idx) => {
        items.push({
          id: `fb-hl-${idx}`,
          type: "card",
          title: h.title,
          description: h.description,
          fullWidth: false,
        });
      });
    }
  }

  return items;
}

export const GalleryCaseView = ({
  title,
  description,
  logo,
  images,
  layout = "stack",
  items,
  highlights,
  infoBlocks,
  locale = "ru",
}: GalleryCaseViewProps) => {
  const isEnglish = locale === "en";

  const effectiveItems =
    items && items.length > 0
      ? items
      : buildFallbackItems(infoBlocks, highlights, isEnglish);

  const segments = segmentItems(effectiveItems);

  return (
    <motion.div
      className="pb-24 min-h-screen"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Шапка кейса: Логотип + Заголовок + Описание */}
      <div className="mx-auto px-4 pt-[200px] md:pt-[240px] max-w-[860px]">
        {/* Логотип кейса слева над заголовком */}
        {logo && (
          <motion.div
            className="mb-8 flex justify-start"
            variants={itemVariants}
          >
            <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-[#1A1A1A] border border-[#272727] p-2 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]">
              <img
                src={logo}
                alt={`${title} logo`}
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        )}

        <motion.h1
          className="font-bold text-[42px] md:text-[50px] leading-[46px] md:leading-[54px] text-foreground tracking-tight"
          variants={itemVariants}
        >
          {title}
        </motion.h1>

        {description && description.trim() && (
          <motion.div
            className="mt-[20px]"
            variants={itemVariants}
          >
            <RichText content={description} />
          </motion.div>
        )}
      </div>

      {/* Лента контента: Заголовки, Карточки, Метрики */}
      {segments.length > 0 && (
        <div className="mx-auto px-4 max-w-[860px]">
          {segments.map((segment, segIdx) => {
            if (segment.type === "heading") {
              return (
                <motion.h2
                  key={`heading-${segIdx}`}
                  className="mt-[56px] mb-[32px] font-medium text-[28px] leading-[35px]"
                  style={{ color: "#9C9C9C" }}
                  variants={itemVariants}
                >
                  {segment.item.title}
                </motion.h2>
              );
            }

            if (segment.type === "card-group") {
              return (
                <div
                  key={`card-group-${segIdx}`}
                  className={cn(
                    "gap-[32px] grid mb-[32px]",
                    segment.cards.length === 1 && segment.cards[0].fullWidth
                      ? "grid-cols-1"
                      : segment.cards.length === 1
                      ? "grid-cols-1"
                      : "grid-cols-1 md:grid-cols-2"
                  )}
                >
                  {segment.cards.map((card, cardIdx) => (
                    <motion.div
                      key={card.id || cardIdx}
                      className="border rounded-[24px]"
                      style={{
                        borderColor: "#272727",
                        borderWidth: "3px",
                        padding: "36px 40px",
                        boxShadow: "inset 0 0 30px rgba(255, 255, 255, 0.08)",
                        backgroundColor: "#16130F",
                      }}
                      variants={itemVariants}
                    >
                      {card.title && (
                        <p
                          className="font-medium text-[28px] leading-[35px]"
                          style={{ color: "#9C9C9C" }}
                        >
                          {card.title}
                        </p>
                      )}
                      {card.description && (
                        <p
                          className={cn(
                            "font-medium text-[28px] leading-[35px] whitespace-pre-line",
                            card.title ? "mt-[20px]" : ""
                          )}
                          style={{ color: "#FFFFFF" }}
                        >
                          {card.description}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              );
            }

            if (segment.type === "metrics") {
              return (
                <div
                  key={`metrics-${segIdx}`}
                  className="gap-[32px] grid grid-cols-1 md:grid-cols-3 mb-[32px]"
                >
                  {segment.item.cards.map((metric, metricIdx) => {
                    const span = metric.span || 1;
                    return (
                      <motion.div
                        key={metric.id || metricIdx}
                        className={cn(
                          "border rounded-[24px]",
                          span === 1 && "col-span-1",
                          span === 2 && "col-span-1 md:col-span-2",
                          span === 3 && "col-span-1 md:col-span-3"
                        )}
                        style={{
                          borderColor: "#272727",
                          borderWidth: "3px",
                          padding: "36px 40px",
                          boxShadow: "inset 0 0 30px rgba(255, 255, 255, 0.08)",
                          backgroundColor: "#16130F",
                        }}
                        variants={itemVariants}
                      >
                        <p
                          className="font-medium text-[28px] leading-[35px]"
                          style={{ color: "#9C9C9C" }}
                        >
                          {metric.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* Кнопка CTA: "Появился вопрос?" */}
      <div className="mx-auto px-4 max-w-[860px] flex justify-center mb-[120px]">
        <QuestionCTAButton isEnglish={isEnglish} />
      </div>

      {/* Галерея изображений */}
      {images && images.length > 0 && (
        layout === "stack" ? (
          <StackGallery images={images} title={title} />
        ) : (
          <MasonryGallery images={images} title={title} />
        )
      )}
    </motion.div>
  );
};

// Компонент картинки с Scale + Opacity эффектом при скролле
function ScaleOnScrollImage({
  image,
  title,
  index,
}: {
  image: string;
  title: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.7"],
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

// Интерактивная кнопка "Появился вопрос?" с ховер-эффектом spotlight
function QuestionCTAButton({ isEnglish }: { isEnglish: boolean }) {
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
    <motion.a
      href="https://t.me/RickBacardin"
      target="_blank"
      rel="noopener noreferrer"
      variants={itemVariants}
      onHoverStart={playHoverSound}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
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
      <span className="relative z-10 font-medium text-[32px] md:text-[50px] leading-[1] text-white tracking-tight">
        {isEnglish ? "Got a question?" : "Появился вопрос?"}
      </span>
    </motion.a>
  );
}
