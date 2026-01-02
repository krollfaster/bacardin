"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CasesList } from "@/components/admin/CasesList";
import { Toaster } from "@/components/ui/sonner";
import type { Case } from "@/types";

export default function AdminPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCases = useCallback(async () => {
    try {
      const response = await fetch("/api/cases?all=true");
      const data = await response.json();
      if (data.success) {
        setCases(data.data || []);
      }
    } catch (error) {
      console.error("Fetch cases error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-8"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        ) : (
          <CasesList cases={cases} onRefresh={fetchCases} />
        )}
      </motion.div>
      <Toaster />
    </>
  );
}

