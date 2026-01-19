"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CasesList } from "@/components/admin/CasesList";
import { HomeOrderManager } from "@/components/admin/HomeOrderManager";
import { SoundSettings } from "@/components/admin/SoundSettings";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Layers, Home, Volume2 } from "lucide-react";
import type { Case } from "@/types";

type Tab = "cases" | "home" | "sounds";

export default function AdminPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as Tab) || "cases";

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
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="border-2 border-primary border-t-transparent rounded-full w-8 h-8"
            />
          </div>
        ) : (
          <>
            {activeTab === "cases" && (
              <CasesList cases={cases} onRefresh={fetchCases} />
            )}
            {activeTab === "home" && (
              <HomeOrderManager cases={cases} onUpdate={fetchCases} />
            )}
            {activeTab === "sounds" && (
              <SoundSettings />
            )}
          </>
        )}
      </motion.div>
      <Toaster />
    </>
  );
}
