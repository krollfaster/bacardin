"use client";

import { motion } from "framer-motion";

interface ComponentCaseViewProps {
  componentUrl: string;
  title: string;
  description?: string;
}

export const ComponentCaseView = ({ componentUrl, title, description }: ComponentCaseViewProps) => {
  return (
    <motion.div
      className="relative w-full h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <iframe
        src={componentUrl}
        title={title}
        className="border-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      {description && (
        <div
          className="right-0 bottom-0 left-0 absolute text-center pointer-events-none"
          style={{
            fontSize: "28px",
            lineHeight: "35px",
            color: "#5F5F5F",
            paddingBottom: "40px",
            fontWeight: 500,
          }}
        >
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {description}
          </div>
        </div>
      )}
    </motion.div>
  );
};
