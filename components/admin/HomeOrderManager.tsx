"use client";

import { useState, useEffect } from "react";
import { Reorder, useDragControls, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  GripVertical, 
  Plus, 
  X, 
  Save, 
  Loader2,
  Home,
  Archive
} from "lucide-react";
import { toast } from "sonner";
import type { Case } from "@/types";
import { cn } from "@/lib/utils";

interface HomeOrderManagerProps {
  cases: Case[];
  onUpdate: () => void;
}

const MAX_HOME_CASES = 6;

export function HomeOrderManager({ cases, onUpdate }: HomeOrderManagerProps) {
  // Кейсы на главной (отсортированные по homeOrder)
  const [homeCases, setHomeCases] = useState<Case[]>([]);
  // Доступные кейсы (опубликованные, но не на главной)
  const [availableCases, setAvailableCases] = useState<Case[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Инициализация списков
  useEffect(() => {
    const featured = cases
      .filter((c) => c.published && c.homeOrder !== null && c.homeOrder > 0)
      .sort((a, b) => (a.homeOrder ?? 99) - (b.homeOrder ?? 99));
    
    const available = cases
      .filter((c) => c.published && (c.homeOrder === null || c.homeOrder === 0 || c.homeOrder === undefined))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    setHomeCases(featured);
    setAvailableCases(available);
    setHasChanges(false);
  }, [cases]);

  // Добавить кейс на главную
  const addToHome = (caseItem: Case) => {
    if (homeCases.length >= MAX_HOME_CASES) {
      toast.error(`Максимум ${MAX_HOME_CASES} кейсов на главной`);
      return;
    }

    setAvailableCases((prev) => prev.filter((c) => c.id !== caseItem.id));
    setHomeCases((prev) => [...prev, caseItem]);
    setHasChanges(true);
  };

  // Убрать кейс с главной
  const removeFromHome = (caseItem: Case) => {
    setHomeCases((prev) => prev.filter((c) => c.id !== caseItem.id));
    setAvailableCases((prev) => 
      [...prev, caseItem].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    );
    setHasChanges(true);
  };

  // Сохранить порядок
  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Формируем обновления для всех кейсов
      const updates = [
        // Кейсы на главной получают порядковые номера
        ...homeCases.map((c, index) => ({
          id: c.id,
          homeOrder: index + 1,
        })),
        // Кейсы не на главной получают null
        ...availableCases.map((c) => ({
          id: c.id,
          homeOrder: null,
        })),
      ];

      const response = await fetch("/api/cases/home-order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Порядок сохранён");
        setHasChanges(false);
        onUpdate();
      } else {
        toast.error(data.error || "Ошибка сохранения");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка сохранения */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Кейсы на главной странице</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Перетаскивайте для изменения порядка. Максимум {MAX_HOME_CASES} кейсов.
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Сохранить
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Кейсы на главной */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Home className="w-4 h-4" />
            На главной ({homeCases.length}/{MAX_HOME_CASES})
          </div>
          
          <div className="min-h-[200px] rounded-lg border border-border bg-card p-2">
            {homeCases.length === 0 ? (
              <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">
                Перетащите кейсы сюда
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={homeCases}
                onReorder={(newOrder) => {
                  setHomeCases(newOrder);
                  setHasChanges(true);
                }}
                className="space-y-2"
              >
                {homeCases.map((caseItem, index) => (
                  <DraggableItem
                    key={caseItem.id}
                    caseItem={caseItem}
                    index={index}
                    onRemove={() => removeFromHome(caseItem)}
                    showPosition
                  />
                ))}
              </Reorder.Group>
            )}
          </div>
        </div>

        {/* Доступные кейсы */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Archive className="w-4 h-4" />
            Доступные кейсы ({availableCases.length})
          </div>
          
          <div className="min-h-[200px] rounded-lg border border-dashed border-border bg-muted/30 p-2">
            {availableCases.length === 0 ? (
              <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">
                Все опубликованные кейсы на главной
              </div>
            ) : (
              <div className="space-y-2">
                {availableCases.map((caseItem) => (
                  <AvailableItem
                    key={caseItem.id}
                    caseItem={caseItem}
                    onAdd={() => addToHome(caseItem)}
                    disabled={homeCases.length >= MAX_HOME_CASES}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Перетаскиваемый элемент на главной
interface DraggableItemProps {
  caseItem: Case;
  index: number;
  onRemove: () => void;
  showPosition?: boolean;
}

function DraggableItem({ caseItem, index, onRemove, showPosition }: DraggableItemProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={caseItem}
      dragListener={false}
      dragControls={controls}
      className="group"
    >
      <motion.div
        layout
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border border-border bg-background",
          "hover:border-primary/50 transition-colors"
        )}
      >
        {/* Позиция */}
        {showPosition && (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {index + 1}
          </div>
        )}

        {/* Обложка */}
        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
          <img
            src={caseItem.coverImage}
            alt={caseItem.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Информация */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{caseItem.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {caseItem.category}
          </p>
        </div>

        {/* Кнопка удаления */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Ручка перетаскивания */}
        <div
          onPointerDown={(e) => controls.start(e)}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </motion.div>
    </Reorder.Item>
  );
}

// Элемент доступного кейса
interface AvailableItemProps {
  caseItem: Case;
  onAdd: () => void;
  disabled?: boolean;
}

function AvailableItem({ caseItem, onAdd, disabled }: AvailableItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-transparent bg-background/50",
        "hover:border-border transition-colors",
        disabled && "opacity-50"
      )}
    >
      {/* Обложка */}
      <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
        <img
          src={caseItem.coverImage}
          alt={caseItem.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Информация */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{caseItem.title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {caseItem.category}
        </p>
      </div>

      {/* Кнопка добавления */}
      <Button
        variant="outline"
        size="sm"
        onClick={onAdd}
        disabled={disabled}
        className="gap-1"
      >
        <Plus className="w-3 h-3" />
        Добавить
      </Button>
    </motion.div>
  );
}
