"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [activeTab, setActiveTab] = useState<Tab>("cases");

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

  const tabs = [
    { id: "cases" as Tab, label: "Кейсы", icon: Layers },
    { id: "home" as Tab, label: "Главная страница", icon: Home },
    { id: "sounds" as Tab, label: "Звуки", icon: Volume2 },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-8"
      >
        {/* Табы */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
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
