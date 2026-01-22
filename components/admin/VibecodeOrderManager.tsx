"use client";

import { useState, useEffect } from "react";
import { Reorder, useDragControls, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    GripVertical,
    Save,
    Loader2,
    Sparkles
} from "lucide-react";
import { toast } from "sonner";
import type { Case } from "@/types";
import { cn } from "@/lib/utils";

interface VibecodeOrderManagerProps {
    cases: Case[];
    onUpdate: () => void;
}

export function VibecodeOrderManager({ cases, onUpdate }: VibecodeOrderManagerProps) {
    // Только вайбкод кейсы
    const [orderedCases, setOrderedCases] = useState<Case[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Инициализация списка
    useEffect(() => {
        const vibecodeCases = cases
            .filter((c) => c.published && c.category === "vibecode")
            .sort((a, b) => {
                const aOrder = a.vibecodeOrder ?? Infinity;
                const bOrder = b.vibecodeOrder ?? Infinity;
                if (aOrder !== bOrder) return aOrder - bOrder;
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            });

        setOrderedCases(vibecodeCases);
        setHasChanges(false);
    }, [cases]);

    // Сохранить порядок
    const handleSave = async () => {
        setIsSaving(true);

        try {
            // Формируем обновления для всех кейсов
            const updates = orderedCases.map((c, index) => ({
                id: c.id,
                vibecodeOrder: index + 1,
            }));

            const response = await fetch("/api/cases/vibecode-order", {
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

    if (orderedCases.length === 0) {
        return (
            <div className="flex justify-center items-center border border-dashed rounded-lg h-[180px] text-muted-foreground text-sm">
                Нет опубликованных вайбкод кейсов
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Заголовок и кнопка сохранения */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="flex items-center gap-2 font-medium text-lg">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Порядок на странице /cases
                    </h3>
                    <p className="mt-1 text-muted-foreground text-sm">
                        Перетаскивайте для изменения порядка отображения
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    size="sm"
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

            {/* Список кейсов */}
            <div className="bg-card p-2 border border-border rounded-lg">
                <Reorder.Group
                    axis="y"
                    values={orderedCases}
                    onReorder={(newOrder) => {
                        setOrderedCases(newOrder);
                        setHasChanges(true);
                    }}
                    className="space-y-2"
                >
                    {orderedCases.map((caseItem, index) => (
                        <DraggableItem
                            key={caseItem.id}
                            caseItem={caseItem}
                            index={index}
                        />
                    ))}
                </Reorder.Group>
            </div>
        </div>
    );
}

// Перетаскиваемый элемент
interface DraggableItemProps {
    caseItem: Case;
    index: number;
}

function DraggableItem({ caseItem, index }: DraggableItemProps) {
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
                    "flex items-center gap-3 bg-background p-3 border border-border rounded-lg",
                    "hover:border-primary/50 transition-colors"
                )}
            >
                {/* Позиция */}
                <div className="flex justify-center items-center bg-primary rounded-full w-6 h-6 font-medium text-primary-foreground text-xs">
                    {index + 1}
                </div>

                {/* Обложка */}
                <div className="flex-shrink-0 bg-muted rounded-md w-12 h-12 overflow-hidden">
                    <img
                        src={caseItem.coverImage}
                        alt={caseItem.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Информация */}
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{caseItem.title}</p>
                    <p className="text-muted-foreground text-xs truncate">
                        {caseItem.type === "component" ? "UI элемент" : "Галерея"}
                    </p>
                </div>

                {/* Ручка перетаскивания */}
                <div
                    onPointerDown={(e) => controls.start(e)}
                    className="hover:bg-muted p-1 rounded cursor-grab active:cursor-grabbing"
                >
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
            </motion.div>
        </Reorder.Item>
    );
}
