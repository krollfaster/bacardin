"use client";

import { motion } from "framer-motion";

interface ComponentCaseViewProps {
  componentUrl: string;
  title: string;
}

export const ComponentCaseView = ({ componentUrl, title }: ComponentCaseViewProps) => {
  return (
    <motion.div
      className="w-full h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <iframe
        src={componentUrl}
        title={title}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </motion.div>
  );
};
