"use client";

import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface LinkPreviewProps {
  children: React.ReactNode;
  href: string;
  previewImage: string;
  altText?: string;
  isExternal?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export const LinkPreview = ({
  children,
  href,
  previewImage,
  altText,
  isExternal = false,
  className,
  width = 260,
  height = 160,
}: LinkPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Spring анимация для плавного горизонтального движения
  const springConfig = { stiffness: 150, damping: 20 };
  const x = useMotionValue(0);
  const springX = useSpring(x, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      // Только горизонтальное смещение относительно центра ссылки
      const offsetX = e.clientX - rect.left - width / 2;
      x.set(offsetX);
    }
  };

  const linkClasses = cn(
    "inline-block hover:opacity-80 font-[500] text-[#96C7FB] text-[28px] underline underline-offset-4 leading-[36px] transition-opacity",
    className
  );

  return (
    <div
      ref={containerRef}
      className="inline-block relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onMouseMove={handleMouseMove}
    >
      {isExternal ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClasses}
        >
          {children}
        </a>
      ) : (
        <Link href={href} className={linkClasses}>
          {children}
        </Link>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              x: springX,
              top: -height - 16,
            }}
            className="left-0 z-50 absolute pointer-events-none"
          >
            <div
              className="shadow-2xl border border-white/10 rounded-xl overflow-hidden"
              style={{
                width,
                height,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
            >
              <Image
                src={previewImage}
                alt={altText || "Превью ссылки"}
                width={width}
                height={height}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
