"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CaseForm, type CaseFormData } from "./CaseForm";
import type { Case } from "@/types";

interface CaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseData?: Case | null;
  onSubmit: (data: CaseFormData) => Promise<void>;
  isLoading?: boolean;
}

export function CaseDialog({
  open,
  onOpenChange,
  caseData,
  onSubmit,
  isLoading = false,
}: CaseDialogProps) {
  const isEditing = !!caseData;

  const handleSubmit = async (data: CaseFormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>
            {isEditing ? "Редактировать кейс" : "Создать новый кейс"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="px-6 pb-6">
            <CaseForm
              initialData={caseData}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              isLoading={isLoading}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

