"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface GalleryCaseViewProps {
  title: string;
  description: string;
  images: string[];
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

export const GalleryCaseView = ({ title, description, images }: GalleryCaseViewProps) => {
  return (
    <motion.div
      className="min-h-screen pb-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Текстовый блок */}
      <div className="max-w-[760px] mx-auto pt-[120px] px-4 mb-16">
        <motion.h1
          className="text-[50px] leading-[54px] font-bold"
          variants={itemVariants}
        >
          {title}
        </motion.h1>
        <motion.p
          className="text-[28px] leading-[35px] mt-4 text-muted-foreground"
          variants={itemVariants}
        >
          {description}
        </motion.p>
      </div>

      {/* Галерея изображений */}
      <motion.div
        className="px-16 flex flex-col gap-8"
        variants={containerVariants}
      >
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="w-full rounded-2xl overflow-hidden"
            variants={itemVariants}
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
        ))}
      </motion.div>
    </motion.div>
  );
};
