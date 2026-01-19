"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FolderOpen, LogOut, Sparkles, Volume2, Home } from "lucide-react";

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeTab = searchParams.get("tab") || "cases";

  const navItems = [
    { id: "cases", label: "Кейсы", icon: FolderOpen },
    { id: "home", label: "Отображение", icon: Home },
    { id: "sounds", label: "Звуки", icon: Volume2 },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col bg-card border-border border-r w-64 h-screen",
        className
      )}
    >
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex justify-center items-center bg-primary/10 rounded-xl w-10 h-10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg">Bacardin</h1>
            <p className="text-muted-foreground text-xs">Панель управления</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "justify-start gap-3 w-full h-11 transition-all",
                activeTab === item.id
                  ? "bg-secondary text-secondary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              onClick={() => handleTabChange(item.id)}
            >
              <item.icon className={cn(
                "w-4 h-4 transition-colors",
                activeTab === item.id ? "text-primary" : "text-muted-foreground"
              )} />
              {item.label}
            </Button>
          ))}
        </div>
      </nav>

      <Separator />

      {/* Footer */}
      <div className="p-4">
        <Button
          variant="ghost"
          className="justify-start gap-3 w-full text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </Button>
      </div>
    </motion.aside>
  );
}

