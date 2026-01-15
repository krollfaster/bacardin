"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import type { GalleryLayout } from "@/types";
import { cn } from "@/lib/utils";

interface GalleryCaseViewProps {
  title: string;
  description: string;
  images: string[];
  layout?: GalleryLayout;
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

export const GalleryCaseView = ({ 
  title, 
  description, 
  images,
  layout = "stack" 
}: GalleryCaseViewProps) => {
  return (
    <motion.div
      className="min-h-screen pb-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Текстовый блок */}
      <div className="max-w-[860px] mx-auto pt-[240px] px-4 mb-16">
        <motion.h1
          className="text-[50px] leading-[54px] font-bold"
          variants={itemVariants}
        >
          {title}
        </motion.h1>
        <motion.div
          className="mt-4"
          variants={itemVariants}
        >
          {description.split(/\n\n+/).map((paragraph, index) => (
            <p 
              key={index}
              className="text-[28px] leading-[35px] text-muted-foreground whitespace-pre-line mb-6 last:mb-0"
            >
              {paragraph}
            </p>
          ))}
        </motion.div>
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
      className="w-full rounded-2xl overflow-hidden origin-center"
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
    <div className="px-4 md:px-16 flex flex-col gap-8">
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
            "break-inside-avoid mb-4 md:mb-6",
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
