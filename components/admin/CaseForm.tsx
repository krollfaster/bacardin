"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  X,
  Image as ImageIcon,
  Link2,
  Folder,
  Edit3,
  Upload,
  Loader2,
  GripVertical,
  HelpCircle,
  Trash2
} from "lucide-react";
import type { Case, CaseType, GalleryLayout, HighlightCard, InfoBlocks, InfoBlockCard, MetricsCard } from "@/types";
import { LayoutList, LayoutGrid } from "lucide-react";

interface CaseFormProps {
  initialData?: Case | null;
  onSubmit: (data: CaseFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// Пустой инфо-блок для инициализации
const emptyInfoBlocks: InfoBlocks = {
  role: { cards: [] },
  strategy: { cards: [] },
  cases: { cards: [] },
  metrics: { cards: [] },
};

export interface CaseFormData {
  type: CaseType;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  date: string;
  category: string;
  coverImage: string;
  images: string[];
  galleryLayout: GalleryLayout;
  componentUrl?: string;
  tags: string[];
  content: string;
  published: boolean;
  featuredOnHome: boolean;
  highlights: HighlightCard[];
  highlights_en: HighlightCard[];
  highlightFooter: string;
  highlightFooter_en: string;
  infoBlocks: InfoBlocks;
  infoBlocks_en: InfoBlocks;
}

interface ElementFolder {
  name: string;
  path: string;
}

const CUSTOM_PATH_VALUE = "__custom__";

const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to ensure cards have IDs
const ensureIds = (blocks?: InfoBlocks): InfoBlocks => {
  if (!blocks) return { role: { cards: [] }, strategy: { cards: [] }, cases: { cards: [] }, metrics: { cards: [] } };

  const processCards = (cards: any[]) => cards.map(c => ({ ...c, id: c.id || generateId() }));

  return {
    role: { cards: processCards(blocks.role?.cards || []) },
    strategy: { cards: processCards(blocks.strategy?.cards || []) },
    cases: { cards: processCards(blocks.cases?.cards || []) },
    metrics: { cards: processCards(blocks.metrics?.cards || []) },
  };
};

export function CaseForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: CaseFormProps) {
  const [formData, setFormData] = useState<CaseFormData>({
    type: "gallery",
    title: "",
    title_en: "",
    description: "",
    description_en: "",
    date: new Date().toISOString().split("T")[0],
    category: "design",
    coverImage: "",
    images: [],
    galleryLayout: "stack",
    componentUrl: "",
    tags: [],
    content: "",
    published: false,
    featuredOnHome: false,
    highlights: [
      { title: "", description: "" },
      { title: "", description: "" },
      { title: "", description: "" },
      { title: "", description: "" },
    ],
    highlights_en: [
      { title: "", description: "" },
      { title: "", description: "" },
      { title: "", description: "" },
      { title: "", description: "" },
    ],
    highlightFooter: "",
    highlightFooter_en: "",
    infoBlocks: { ...emptyInfoBlocks },
    infoBlocks_en: { ...emptyInfoBlocks },
  });

  const [activeLang, setActiveLang] = useState<"ru" | "en">("ru");
  const [activeInfoBlockTab, setActiveInfoBlockTab] = useState<"role" | "strategy" | "cases" | "metrics">("role");

  const [newTag, setNewTag] = useState("");
  const [elementFolders, setElementFolders] = useState<ElementFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [isCustomPath, setIsCustomPath] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Загрузка списка папок Elements
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await fetch("/api/elements");
        const data = await response.json();
        if (data.success) {
          setElementFolders(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching elements:", error);
      }
    };
    fetchFolders();
  }, []);

  // Инициализация данных формы
  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || "gallery",
        title: initialData.title,
        title_en: initialData.title_en || "",
        description: initialData.description,
        description_en: initialData.description_en || "",
        date: initialData.date || new Date().toISOString().split("T")[0],
        category: initialData.category,
        coverImage: initialData.coverImage,
        images: initialData.images || [],
        galleryLayout: initialData.galleryLayout || "stack",
        componentUrl: initialData.componentUrl || "",
        tags: initialData.tags || [],
        content: initialData.content,
        published: initialData.published,
        featuredOnHome: initialData.featuredOnHome || false,
        highlights: initialData.highlights?.length === 4
          ? initialData.highlights
          : [
            { title: "", description: "" },
            { title: "", description: "" },
            { title: "", description: "" },
            { title: "", description: "" },
          ],
        highlights_en: initialData.highlights_en?.length === 4
          ? initialData.highlights_en
          : [
            { title: "", description: "" },
            { title: "", description: "" },
            { title: "", description: "" },
            { title: "", description: "" },
          ],
        highlightFooter: initialData.highlightFooter || "",
        highlightFooter_en: initialData.highlightFooter_en || "",
        infoBlocks: ensureIds(initialData.infoBlocks),
        infoBlocks_en: ensureIds(initialData.infoBlocks_en),
      });

      // Определяем, является ли componentUrl папкой из Elements или кастомным
      if (initialData.componentUrl) {
        const matchingFolder = elementFolders.find(
          (f) => f.path === initialData.componentUrl
        );
        if (matchingFolder) {
          setSelectedFolder(matchingFolder.path);
          setIsCustomPath(false);
        } else {
          setSelectedFolder(CUSTOM_PATH_VALUE);
          setIsCustomPath(true);
        }
      }
    }
  }, [initialData, elementFolders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleFolderSelect = (value: string) => {
    setSelectedFolder(value);
    if (value === CUSTOM_PATH_VALUE) {
      setIsCustomPath(true);
      setFormData((prev) => ({ ...prev, componentUrl: "" }));
    } else {
      setIsCustomPath(false);
      setFormData((prev) => ({ ...prev, componentUrl: value }));
    }
  };

  // Загрузка файла
  const uploadFile = async (file: File): Promise<string | null> => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await response.json();
      if (data.success) {
        return data.data.path;
      }
      console.error("Upload failed:", data.error);
      return null;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  // Обработка выбора обложки
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCoverUploading(true);
    const path = await uploadFile(file);
    if (path) {
      setFormData((prev) => ({ ...prev, coverImage: path }));
    }
    setIsCoverUploading(false);

    // Сбрасываем input для повторного выбора того же файла
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  // Обработка выбора изображений галереи
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    const uploadPromises = Array.from(files).map((file) => uploadFile(file));
    const paths = await Promise.all(uploadPromises);

    const validPaths = paths.filter((p): p is string => p !== null);
    if (validPaths.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...validPaths],
      }));
    }

    setIsUploading(false);

    // Сбрасываем input
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Тип кейса и Категория - основные характеристики */}
      <div className="gap-4 grid grid-cols-2">
        <div className="space-y-2">
          <Label>Тип кейса</Label>
          <Select
            value={formData.type}
            onValueChange={(value: CaseType) =>
              setFormData((prev) => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gallery">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Галерея
                </div>
              </SelectItem>
              <SelectItem value="component">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Компонент
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Категория</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, category: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="design">Дизайн (показ на главной)</SelectItem>
              <SelectItem value="vibecode">Вайбкод (страница /cases)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Вторичные настройки - зависят от типа кейса */}
      <AnimatePresence mode="wait">
        {formData.type === "component" ? (
          <motion.div
            key="component-settings"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="space-y-2">
              <Label>Папка компонента</Label>
              <Select value={selectedFolder} onValueChange={handleFolderSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите папку из Elements" />
                </SelectTrigger>
                <SelectContent>
                  {elementFolders.map((folder) => (
                    <SelectItem key={folder.path} value={folder.path}>
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-muted-foreground" />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem value={CUSTOM_PATH_VALUE}>
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-muted-foreground" />
                      Указать свой путь...
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Кастомный путь или выбранный путь */}
            <div className="space-y-2">
              {isCustomPath ? (
                <>
                  <Label htmlFor="componentUrl">Путь к компоненту *</Label>
                  <Input
                    id="componentUrl"
                    value={formData.componentUrl}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        componentUrl: e.target.value,
                      }))
                    }
                    placeholder="/Elements/MyWidget или https://..."
                  />
                </>
              ) : selectedFolder ? (
                <>
                  <Label>Выбранный путь</Label>
                  <div className="flex items-center gap-2 bg-muted/50 px-3 border border-border rounded-md h-10">
                    <Folder className="w-4 h-4 text-primary" />
                    <span className="font-mono text-sm truncate">{selectedFolder}</span>
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="gallery-settings"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <div className="space-y-2">
              <Label>Вид галереи</Label>
              <Select
                value={formData.galleryLayout}
                onValueChange={(value: GalleryLayout) =>
                  setFormData((prev) => ({ ...prev, galleryLayout: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stack">
                    <div className="flex items-center gap-2">
                      <LayoutList className="w-4 h-4" />
                      Стек (по вертикали)
                    </div>
                  </SelectItem>
                  <SelectItem value="masonry">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" />
                      Сетка (masonry)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Обложка */}
      <div className="space-y-2">
        <Label>Обложка *</Label>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          className="hidden"
        />

        {formData.coverImage ? (
          <div className="group relative">
            <div className="relative bg-muted border border-border rounded-lg aspect-video overflow-hidden">
              <img
                src={formData.coverImage}
                alt="Обложка"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex justify-center items-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isCoverUploading}
                >
                  Заменить
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, coverImage: "" }))}
                >
                  Удалить
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={isCoverUploading}
            className="flex flex-col justify-center items-center gap-2 border-2 border-border hover:border-primary/50 border-dashed rounded-lg w-full aspect-video text-muted-foreground hover:text-foreground transition-colors"
          >
            {isCoverUploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm">Загрузка...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8" />
                <span className="text-sm">Нажмите для выбора обложки</span>
                <span className="text-muted-foreground text-xs">JPG, PNG, GIF, WebP до 10MB</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Основные поля и переключатель языка */}
      <div className="flex items-end gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="title">
            Название {activeLang === "ru" ? "*" : "(опционально)"}
          </Label>
          <Input
            id="title"
            value={activeLang === "ru" ? formData.title : formData.title_en}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                [activeLang === "ru" ? "title" : "title_en"]: e.target.value,
              }))
            }
            placeholder={activeLang === "ru" ? "Название кейса" : "Case title"}
            required={activeLang === "ru"}
          />
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg h-10">
          <button
            type="button"
            onClick={() => setActiveLang("ru")}
            className={`w-10 h-8 flex items-center justify-center rounded-md text-base transition-colors ${activeLang === "ru"
              ? "bg-background shadow-sm"
              : "hover:bg-background/50"
              }`}
            title="Русский"
          >
            🇷🇺
          </button>
          <button
            type="button"
            onClick={() => setActiveLang("en")}
            className={`w-10 h-8 flex items-center justify-center rounded-md text-base transition-colors ${activeLang === "en"
              ? "bg-background shadow-sm"
              : "hover:bg-background/50"
              }`}
            title="English"
          >
            🇬🇧
          </button>
        </div>
      </div>



      {/* Описание */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="description">
            Описание {activeLang === "ru" ? "*" : "(опционально)"}
          </Label>
          <div className="group relative">
            <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />

            {/* Tooltip Content */}
            <div className="bottom-full left-0 z-50 absolute opacity-0 group-hover:opacity-100 mb-2 w-80 transition-all translate-y-2 group-hover:translate-y-0 duration-200 pointer-events-none group-hover:pointer-events-auto transform">
              <div className="bg-popover shadow-xl p-4 border border-border rounded-lg text-xs">
                <p className="mb-3 font-medium text-foreground">Форматирование текста:</p>
                <div className="gap-x-4 gap-y-2 grid grid-cols-1">
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] whitespace-nowrap">## Заголовок</code>
                    <span className="text-[11px] text-muted-foreground">заголовок секции</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] whitespace-nowrap">**текст**</code>
                    <span className="text-[11px] text-muted-foreground">выделенный белым</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] whitespace-nowrap">*текст*</code>
                    <span className="text-[11px] text-muted-foreground">курсив</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] whitespace-nowrap">1. текст</code>
                    <span className="text-[11px] text-muted-foreground">нумерованный список</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px] whitespace-nowrap">- текст</code>
                    <span className="text-[11px] text-muted-foreground">маркированный список</span>
                  </div>
                </div>
                <p className="mt-3 pt-2 border-border border-t text-[10px] text-muted-foreground/70">
                  Пустая строка разделяет блоки текста
                </p>
              </div>
            </div>
          </div>
        </div>
        <Textarea
          id="description"
          value={activeLang === "ru" ? formData.description : formData.description_en}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              [activeLang === "ru" ? "description" : "description_en"]: e.target.value,
            }))
          }
          placeholder={
            activeLang === "ru"
              ? "Описание кейса..."
              : "Case description..."
          }
          rows={8}
          required={activeLang === "ru"}
          className="font-mono text-sm"
        />
      </div>






      {/* Инфо-блоки - только для типа Галерея и категории Дизайн */}
      <AnimatePresence mode="wait">
        {formData.type === "gallery" && formData.category === "design" && (
          <motion.div
            key="info-blocks-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="space-y-3">
              {/* Заголовок секции */}
              <Label>Инфо-блоки</Label>

              {/* Табы блоков */}
              <div className="flex gap-2 bg-muted/30 p-1 rounded-lg">
                {(["role", "strategy", "cases", "metrics"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveInfoBlockTab(tab)}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeInfoBlockTab === tab
                      ? "bg-background shadow-sm"
                      : "hover:bg-background/50 text-muted-foreground"
                      }`}
                  >
                    {tab === "role" ? "Контекст" : tab === "strategy" ? "Действия" : tab === "cases" ? "Влияние" : "Метрики"}
                  </button>
                ))}
              </div>

              {/* Карточки текущего блока */}
              {activeInfoBlockTab === "metrics" ? (
                <MetricsBlockEditor
                  formData={formData}
                  setFormData={setFormData}
                  activeLang={activeLang}
                />
              ) : (
                <InfoBlockEditor
                  blockKey={activeInfoBlockTab}
                  formData={formData}
                  setFormData={setFormData}
                  activeLang={activeLang}
                />
              )}

              {/* Подпись под блоками */}
              <div className="space-y-2 mt-4 pt-4 border-border/50 border-t">
                <Label>Подпись под блоками</Label>
                <Textarea
                  value={activeLang === "ru" ? formData.highlightFooter : formData.highlightFooter_en}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [activeLang === "ru" ? "highlightFooter" : "highlightFooter_en"]: e.target.value,
                    }))
                  }
                  placeholder={
                    activeLang === "ru"
                      ? "Текст под блоком инфографики (например: 'Готов детально разобрать...')"
                      : "Footer text below infographics (e.g. 'Ready to discuss...')"
                  }
                  rows={2}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Поля для типа Галерея */}
      <AnimatePresence mode="wait">
        {formData.type === "gallery" && (
          <motion.div
            key="gallery-fields"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="space-y-2">
              <Label>Изображения галереи</Label>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isUploading}
                className="flex justify-center items-center gap-2 p-4 border-2 border-border hover:border-primary/50 border-dashed rounded-lg w-full text-muted-foreground hover:text-foreground transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Загрузка изображений...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">Добавить изображения</span>
                  </>
                )}
              </button>

              {formData.images.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-muted-foreground text-xs">
                    Перетаскивайте для изменения порядка
                  </p>
                  <Reorder.Group
                    axis="y"
                    values={formData.images}
                    onReorder={(newOrder) =>
                      setFormData((prev) => ({ ...prev, images: newOrder }))
                    }
                    className="space-y-2"
                  >
                    {formData.images.map((img) => (
                      <DraggableImageItem
                        key={img}
                        image={img}
                        onRemove={() => removeImage(formData.images.indexOf(img))}
                      />
                    ))}
                  </Reorder.Group>
                </div>
              )}
            </div>
          </motion.div>
        )}


      </AnimatePresence>

      <div className="gap-4 grid grid-cols-2">
        {/* Дата */}
        <div className="space-y-2">
          <Label htmlFor="date">Дата *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            required
          />
        </div>

        {/* Теги */}
        <div className="space-y-2">
          <Label>Теги</Label>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Добавить тег"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>



      {/* Публикация */}
      {/* Футер формы с публикацией и кнопками */}
      <div className="flex justify-between items-center pt-6 border-border border-t">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={formData.published}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, published: e.target.checked }))
            }
            className="border-border rounded w-4 h-4 accent-primary cursor-pointer"
          />
          <Label htmlFor="published" className="font-medium text-sm cursor-pointer">
            Опубликовать кейс
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="border-2 border-current border-t-transparent rounded-full w-4 h-4"
              />
            ) : initialData ? (
              "Сохранить"
            ) : (
              "Создать"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

// Редактор инфо-блока
interface InfoBlockEditorProps {
  blockKey: "role" | "strategy" | "cases";
  formData: CaseFormData;
  setFormData: React.Dispatch<React.SetStateAction<CaseFormData>>;
  activeLang: "ru" | "en";
}

function InfoBlockEditor({ blockKey, formData, setFormData, activeLang }: InfoBlockEditorProps) {
  const targetField = activeLang === "ru" ? "infoBlocks" : "infoBlocks_en";
  const infoBlocks = formData[targetField];
  const currentBlock = infoBlocks[blockKey];
  const cards = currentBlock?.cards || [];

  // Добавить карточку
  const addCard = () => {
    const newCard: InfoBlockCard = { title: "", description: "", fullWidth: false, id: generateId() };
    const updatedCards = [...cards, newCard];

    setFormData((prev) => ({
      ...prev,
      [targetField]: {
        ...prev[targetField],
        [blockKey]: { cards: updatedCards },
      },
    }));
  };

  // Удалить карточку
  const removeCard = (index: number) => {
    const updatedCards = cards.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      [targetField]: {
        ...prev[targetField],
        [blockKey]: { cards: updatedCards },
      },
    }));
  };

  // Обновить карточку
  const updateCard = (index: number, field: keyof InfoBlockCard, value: string | boolean) => {
    const updatedCards = [...cards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };

    setFormData((prev) => ({
      ...prev,
      [targetField]: {
        ...prev[targetField],
        [blockKey]: { cards: updatedCards },
      },
    }));
  };

  // Обработка перетаскивания
  const handleReorder = (newOrder: InfoBlockCard[]) => {
    setFormData((prev) => ({
      ...prev,
      [targetField]: {
        ...prev[targetField],
        [blockKey]: { cards: newOrder },
      },
    }));
  };

  return (
    <div className="space-y-3">
      {/* Список карточек */}
      {cards.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-8 border-2 border-border border-dashed rounded-lg text-muted-foreground">
          <p className="mb-2 text-sm">
            {activeLang === "ru" ? "Нет карточек в этом блоке" : "No cards in this block"}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addCard}>
            <Plus className="mr-1 w-4 h-4" />
            {activeLang === "ru" ? "Добавить карточку" : "Add card"}
          </Button>
        </div>
      ) : (
        <Reorder.Group axis="y" values={cards} onReorder={handleReorder} className="space-y-3">
          {cards.map((card, index) => (
            <DraggableInfoBlockCard
              key={card.id || index}
              card={card}
              index={index}
              activeLang={activeLang}
              onUpdate={(field, value) => updateCard(index, field, value)}
              onRemove={() => removeCard(index)}
            />
          ))}
        </Reorder.Group>
      )}

      {/* Кнопка добавления */}
      {cards.length > 0 && (
        <Button type="button" variant="outline" size="sm" onClick={addCard} className="w-full">
          <Plus className="mr-1 w-4 h-4" />
          {activeLang === "ru" ? "Добавить карточку" : "Add card"}
        </Button>
      )}
    </div>
  );
}

// Редактор блока метрик (только описание + span)
interface MetricsBlockEditorProps {
  formData: CaseFormData;
  setFormData: React.Dispatch<React.SetStateAction<CaseFormData>>;
  activeLang: "ru" | "en";
}

function MetricsBlockEditor({ formData, setFormData, activeLang }: MetricsBlockEditorProps) {
  const targetField = activeLang === "ru" ? "infoBlocks" : "infoBlocks_en";
  const infoBlocks = formData[targetField];
  const metricsBlock = infoBlocks.metrics;
  const cards = metricsBlock?.cards || [];

  // Добавить карточку
  const addCard = () => {
    const newCard: MetricsCard = { description: "", span: 1, id: generateId() };
    const updatedCards = [...cards, newCard];

    setFormData((prev) => ({
      ...prev,
      [targetField]: {
        ...prev[targetField],
        metrics: { cards: updatedCards },
      },
    }));
  };

  // Удалить карточку
  const removeCard = (index: number) => {
    const updatedCards = cards.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      [targetField]: {
        ...prev[targetField],
        metrics: { cards: updatedCards },
      },
    }));
  };

  // Обновить карточку
  const updateCard = (index: number, field: keyof MetricsCard, value: string | number) => {
    const updatedCards = [...cards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };

    setFormData((prev) => ({
      ...prev,
      [targetField]: {
        ...prev[targetField],
        metrics: { cards: updatedCards },
      },
    }));
  };

  // Обработка перетаскивания
  const handleReorder = (newOrder: MetricsCard[]) => {
    setFormData((prev) => ({
      ...prev,
      [targetField]: {
        ...prev[targetField],
        metrics: { cards: newOrder },
      },
    }));
  };

  return (
    <div className="space-y-3">
      {/* Список карточек */}
      {cards.length === 0 ? (
        <div className="flex flex-col justify-center items-center py-8 border-2 border-border border-dashed rounded-lg text-muted-foreground">
          <p className="mb-2 text-sm">
            {activeLang === "ru" ? "Нет карточек метрик" : "No metrics cards"}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addCard}>
            <Plus className="mr-1 w-4 h-4" />
            {activeLang === "ru" ? "Добавить метрику" : "Add metric"}
          </Button>
        </div>
      ) : (
        <Reorder.Group axis="y" values={cards} onReorder={handleReorder} className="space-y-3">
          {cards.map((card, index) => (
            <DraggableMetricsCard
              key={card.id || index}
              card={card}
              index={index}
              activeLang={activeLang}
              onUpdate={(field, value) => updateCard(index, field, value)}
              onRemove={() => removeCard(index)}
            />
          ))}
        </Reorder.Group>
      )}

      {/* Кнопка добавления */}
      {cards.length > 0 && (
        <Button type="button" variant="outline" size="sm" onClick={addCard} className="w-full">
          <Plus className="mr-1 w-4 h-4" />
          {activeLang === "ru" ? "Добавить метрику" : "Add metric"}
        </Button>
      )}
    </div>
  );
}

// Перетаскиваемый элемент изображения
interface DraggableImageItemProps {
  image: string;
  onRemove: () => void;
}

function DraggableImageItem({ image, onRemove }: DraggableImageItemProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={image}
      dragListener={false}
      dragControls={controls}
      className="group"
    >
      <div className="flex items-center gap-3 bg-background p-2 border border-border hover:border-primary/50 rounded-lg transition-colors">
        {/* Превью изображения */}
        <div className="flex-shrink-0 bg-muted rounded-md w-16 h-16 overflow-hidden">
          <img
            src={image}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Путь к файлу */}
        <div className="flex-1 min-w-0">
          <p className="font-mono text-muted-foreground text-xs truncate">
            {image.split('/').pop()}
          </p>
        </div>

        {/* Кнопка удаления */}
        <button
          type="button"
          onClick={onRemove}
          className="hover:bg-destructive/10 p-1.5 rounded-md text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ручка перетаскивания */}
        <div
          onPointerDown={(e) => controls.start(e)}
          className="hover:bg-muted p-1.5 rounded-md cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </Reorder.Item>
  );
}

interface DraggableInfoBlockCardProps {
  card: InfoBlockCard;
  index: number;
  activeLang: "ru" | "en";
  onUpdate: (field: keyof InfoBlockCard, value: string | boolean) => void;
  onRemove: () => void;
}

function DraggableInfoBlockCard({ card, index, activeLang, onUpdate, onRemove }: DraggableInfoBlockCardProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={card}
      dragListener={false}
      dragControls={controls}
      className="relative space-y-2 bg-muted/30 p-4 border border-border rounded-lg"
    >
      {/* Заголовок карточки с Drag Handle */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="flex justify-center items-center bg-primary/10 rounded-full w-6 h-6 font-medium text-primary text-xs">
            {index + 1}
          </span>
          <label className="flex items-center gap-2 text-muted-foreground text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={card.fullWidth ?? false}
              onChange={(e) => onUpdate("fullWidth", e.target.checked)}
              className="border-border rounded w-3.5 h-3.5 accent-primary cursor-pointer"
            />
            {activeLang === "ru" ? "Во всю ширину" : "Full width"}
          </label>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRemove}
            className="hover:bg-destructive/10 p-1.5 rounded-md text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div
            onPointerDown={(e) => controls.start(e)}
            className="hover:bg-muted p-1.5 rounded-md cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Поля ввода */}
      <Input
        value={card.title}
        onChange={(e) => onUpdate("title", e.target.value)}
        placeholder={activeLang === "ru" ? "Заголовок карточки" : "Card title"}
        className="bg-background text-sm"
      />
      <Textarea
        value={card.description}
        onChange={(e) => onUpdate("description", e.target.value)}
        placeholder={activeLang === "ru" ? "Описание карточки" : "Card description"}
        rows={2}
        className="bg-background text-sm"
      />
    </Reorder.Item>
  );
}

interface DraggableMetricsCardProps {
  card: MetricsCard;
  index: number;
  activeLang: "ru" | "en";
  onUpdate: (field: keyof MetricsCard, value: string | number) => void;
  onRemove: () => void;
}

function DraggableMetricsCard({ card, index, activeLang, onUpdate, onRemove }: DraggableMetricsCardProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={card}
      dragListener={false}
      dragControls={controls}
      className="space-y-2 bg-muted/30 p-4 border border-border rounded-lg"
    >
      {/* Заголовок карточки с Drag Handle */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <span className="flex justify-center items-center bg-primary/10 rounded-full w-6 h-6 font-medium text-primary text-xs">
            {index + 1}
          </span>
          <div className="flex items-center gap-2">
            <label className="text-muted-foreground text-xs">
              {activeLang === "ru" ? "Ширина:" : "Width:"}
            </label>
            <Select
              value={String(card.span || 1)}
              onValueChange={(value) => onUpdate("span", Number(value) as 1 | 2 | 3)}
            >
              <SelectTrigger className="bg-background w-20 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRemove}
            className="hover:bg-destructive/10 p-1.5 rounded-md text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div
            onPointerDown={(e) => controls.start(e)}
            className="hover:bg-muted p-1.5 rounded-md cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Только описание */}
      <Textarea
        value={card.description}
        onChange={(e) => onUpdate("description", e.target.value)}
        placeholder={activeLang === "ru" ? "Текст метрики (например: NPS: +6 p.p)" : "Metric text (e.g. NPS: +6 p.p)"}
        rows={2}
        className="bg-background text-sm"
      />
    </Reorder.Item>
  );
}
