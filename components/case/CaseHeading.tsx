"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface CaseHeadingProps {
  title: string;
  variants?: Variants;
  className?: string;
}

export const CaseHeading = ({
  title,
  variants,
  className,
}: CaseHeadingProps) => {
  if (!title || !title.trim()) return null;

  return (
    <motion.h2
      className={cn(
        "mt-[52px] mb-[32px] font-medium text-[28px] leading-[36px]",
        className
      )}
      style={{ color: "#9C9C9C" }}
      variants={variants}
    >
      {title}
    </motion.h2>
  );
};
