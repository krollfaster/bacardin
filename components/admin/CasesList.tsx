"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Link2,
  Eye,
  EyeOff,
} from "lucide-react";
import { CaseDialog } from "./CaseDialog";
import type { CaseFormData } from "./CaseForm";
import type { Case } from "@/types";

interface CasesListProps {
  cases: Case[];
  onRefresh: () => void;
}

export function CasesList({ cases, onRefresh }: CasesListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [deletingCase, setDeletingCase] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = () => {
    setEditingCase(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (caseItem: Case) => {
    setEditingCase(caseItem);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingCase) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/cases/${deletingCase.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsLoading(false);
      setDeletingCase(null);
    }
  };

  const handleSubmit = async (data: CaseFormData) => {
    setIsLoading(true);
    try {
      const url = editingCase
        ? `/api/cases/${editingCase.id}`
        : "/api/cases";
      const method = editingCase ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onRefresh();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Кейсы</h2>
          <p className="text-muted-foreground mt-1">
            Управление портфолио проектов
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Добавить кейс
        </Button>
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        {cases.length === 0 ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Нет кейсов
            </h3>
            <p className="text-muted-foreground mb-4">
              Создайте первый кейс для портфолио
            </p>
            <Button onClick={handleCreate} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Создать кейс
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Тип</TableHead>
                <TableHead>Название</TableHead>
                <TableHead className="w-[120px]">Дата</TableHead>
                <TableHead className="w-[100px]">Статус</TableHead>
                <TableHead className="w-[120px] text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {cases.map((caseItem, index) => (
                  <motion.tr
                    key={caseItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1",
                          caseItem.type === "gallery"
                            ? "border-blue-500/50 text-blue-500"
                            : "border-purple-500/50 text-purple-500"
                        )}
                      >
                        {caseItem.type === "gallery" ? (
                          <>
                            <ImageIcon className="w-3 h-3" />
                            Галерея
                          </>
                        ) : (
                          <>
                            <Link2 className="w-3 h-3" />
                            Компонент
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {caseItem.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                          {caseItem.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(caseItem.date)}
                    </TableCell>
                    <TableCell>
                      {caseItem.published ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-500/10 text-green-500 border-green-500/20"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Опубликован
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-muted text-muted-foreground"
                        >
                          <EyeOff className="w-3 h-3 mr-1" />
                          Черновик
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(caseItem)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => setDeletingCase(caseItem)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <CaseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        caseData={editingCase}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingCase} onOpenChange={() => setDeletingCase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить кейс?</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить кейс &quot;{deletingCase?.title}&quot;?
              Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingCase(null)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

