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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-foreground text-2xl">Кейсы</h2>
          <p className="mt-1 text-muted-foreground">
            Управление портфолио проектов
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Добавить кейс
        </Button>
      </div>

      {/* Sections */}
      <div className="space-y-12">
        {/* Дизайн */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="bg-amber-500 rounded-full w-1.5 h-6" />
            <h3 className="font-semibold text-foreground text-lg">Дизайн</h3>
            <Badge variant="outline" className="ml-2 font-mono">
              {cases.filter(c => c.category === "design").length}
            </Badge>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {cases.filter(c => c.category === "design").length === 0 ? (
              <EmptyState category="design" onCreate={handleCreate} />
            ) : (
              <CasesTable
                cases={cases.filter(c => c.category === "design")}
                onEdit={handleEdit}
                onDelete={(c) => setDeletingCase(c)}
                formatDate={formatDate}
              />
            )}
          </div>
        </section>

        {/* Вайбкод */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="bg-indigo-500 rounded-full w-1.5 h-6" />
            <h3 className="font-semibold text-foreground text-lg">Вайбкод</h3>
            <Badge variant="outline" className="ml-2 font-mono">
              {cases.filter(c => c.category === "vibecode").length}
            </Badge>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {cases.filter(c => c.category === "vibecode").length === 0 ? (
              <EmptyState category="vibecode" onCreate={handleCreate} />
            ) : (
              <CasesTable
                cases={cases.filter(c => c.category === "vibecode")}
                onEdit={handleEdit}
                onDelete={(c) => setDeletingCase(c)}
                formatDate={formatDate}
              />
            )}
          </div>
        </section>
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

// Вспомогательный компонент для таблицы
function CasesTable({ cases, onEdit, onDelete, formatDate }: {
  cases: Case[],
  onEdit: (c: Case) => void,
  onDelete: (c: Case) => void,
  formatDate: (d: string) => string
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px] text-center">
            <Eye className="mx-auto w-4 h-4 text-muted-foreground" />
          </TableHead>
          <TableHead className="w-[50px] text-center">
            <div className="flex justify-center" title="Тип кейса">
              <ImageIcon className="mx-auto w-4 h-4 text-muted-foreground" />
            </div>
          </TableHead>
          <TableHead>Название</TableHead>
          <TableHead className="w-[120px]">Дата</TableHead>
          <TableHead className="pr-6 w-[140px] text-right">Действия</TableHead>
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
              <TableCell className="text-center">
                {caseItem.published ? (
                  <div className="flex justify-center" title="Опубликован">
                    <Eye className="w-4 h-4 text-green-500" />
                  </div>
                ) : (
                  <div className="flex justify-center" title="Черновик">
                    <EyeOff className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  {caseItem.type === "gallery" ? (
                    <div title="Галерея">
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                    </div>
                  ) : (
                    <div title="Компонент">
                      <Link2 className="w-4 h-4 text-purple-500" />
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-foreground">
                    {caseItem.title}
                  </p>
                  <p className="max-w-[300px] text-muted-foreground text-sm truncate">
                    {caseItem.description}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(caseItem.date)}
              </TableCell>
              <TableCell className="pr-6 text-right">
                <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => onEdit(caseItem)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 hover:text-destructive"
                    onClick={() => onDelete(caseItem)}
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
  );
}

// Вспомогательный компонент для пустого состояния
function EmptyState({ category, onCreate }: { category: string, onCreate: () => void }) {
  return (
    <div className="py-12 text-center">
      <div className="inline-flex justify-center items-center bg-muted mb-3 rounded-full w-12 h-12">
        <ImageIcon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="mb-1 font-medium text-foreground text-sm">
        Нет кейсов в категории &quot;{category === "design" ? "Дизайн" : "Вайбкод"}&quot;
      </h3>
      <Button onClick={onCreate} variant="ghost" size="sm" className="gap-2 text-xs">
        <Plus className="w-3 h-3" />
        Создать
      </Button>
    </div>
  );
}

