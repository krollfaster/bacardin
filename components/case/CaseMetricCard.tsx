"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MetricSubCard } from "@/types";

interface CaseMetricCardProps {
  metric: MetricSubCard;
  variants?: Variants;
  className?: string;
}

export const CaseMetricCard = ({
  metric,
  variants,
  className,
}: CaseMetricCardProps) => {
  if (!metric.description || !metric.description.trim()) return null;

  const span = metric.span || 1;

  return (
    <motion.div
      className={cn(
        "border rounded-[24px]",
        span === 1 && "col-span-1",
        span === 2 && "col-span-1 md:col-span-2",
        span === 3 && "col-span-1 md:col-span-3",
        className
      )}
      style={{
        borderColor: "#272727",
        borderWidth: "3px",
        padding: "36px 40px 37px 40px",
        backgroundColor: "#16130F",
      }}
      variants={variants}
    >
      <p
        className="font-medium text-[28px] leading-[36px] whitespace-pre-line"
        style={{ color: "#9C9C9C" }}
      >
        {metric.description}
      </p>
    </motion.div>
  );
};
