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
import { toast } from "sonner";
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
  Trash2,
  Heading as HeadingIcon,
  Layers,
  BarChart2,
  LayoutList,
  LayoutGrid,
  Eye,
} from "lucide-react";
import type {
  Case,
  CaseType,
  GalleryLayout,
  CaseItem,
  CaseHeadingItem,
  CaseCardItem,
  CaseMetricsItem,
  CasePreviewItem,
  PreviewImage,
  MetricSubCard,
} from "@/types";

interface CaseFormProps {
  initialData?: Case | null;
  onSubmit: (data: CaseFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface CaseFormData {
  type: CaseType;
  title: string;
  title_en: string;
  subtitle?: string;
  subtitle_en?: string;
  description: string;
  description_en: string;
  logo?: string;
  accentColor?: string;
  date: string;
  category: string;
  coverImage: string;
  images: string[];
  galleryLayout: GalleryLayout;
  componentUrl?: string;
  tags?: string[];
  content: string;
  published: boolean;
  featuredOnHome: boolean;
  items: CaseItem[];
  items_en: CaseItem[];
}

interface ElementFolder {
  name: string;
  path: string;
}

const CUSTOM_PATH_VALUE = "__custom__";

const generateId = () => Math.random().toString(36).substr(2, 9);

// Хелпер конвертации старых данных (infoBlocks / highlights) в новую плоскую ленту
function convertLegacyToItems(caseData?: Case | null, lang: "ru" | "en" = "ru"): CaseItem[] {
  if (!caseData) return [];

  // Если уже сохранены items нового формата — используем их
  const existingItems = lang === "ru" ? caseData.items : caseData.items_en;
  if (existingItems && existingItems.length > 0) {
    return existingItems.map((item) => ({ ...item, id: item.id || generateId() }));
  }

  const items: CaseItem[] = [];
  const blocks = lang === "ru" ? caseData.infoBlocks : caseData.infoBlocks_en;
  const fallbackBlocks = caseData.infoBlocks;
  const targetBlocks = blocks || fallbackBlocks;

  if (targetBlocks) {
    if (targetBlocks.role?.cards && targetBlocks.role.cards.length > 0) {
      items.push({
        id: generateId(),
        type: "heading",
        title: lang === "ru" ? "Контекст" : "Context",
      });
      targetBlocks.role.cards.forEach((c) => {
        items.push({
          id: c.id || generateId(),
          type: "card",
          title: c.title,
          description: c.description,
          fullWidth: c.fullWidth ?? false,
        });
      });
    }

    if (targetBlocks.strategy?.cards && targetBlocks.strategy.cards.length > 0) {
      items.push({
        id: generateId(),
        type: "heading",
        title: lang === "ru" ? "Действия" : "Actions",
      });
      targetBlocks.strategy.cards.forEach((c) => {
        items.push({
          id: c.id || generateId(),
          type: "card",
          title: c.title,
          description: c.description,
          fullWidth: c.fullWidth ?? false,
        });
      });
    }

    if (targetBlocks.cases?.cards && targetBlocks.cases.cards.length > 0) {
      items.push({
        id: generateId(),
        type: "heading",
        title: lang === "ru" ? "Влияние" : "Impact",
      });
      targetBlocks.cases.cards.forEach((c) => {
        items.push({
          id: c.id || generateId(),
          type: "card",
          title: c.title,
          description: c.description,
          fullWidth: c.fullWidth ?? false,
        });
      });
    }

    if (targetBlocks.metrics?.cards && targetBlocks.metrics.cards.length > 0) {
      items.push({
        id: generateId(),
        type: "heading",
        title: lang === "ru" ? "Метрики" : "Metrics",
      });
      items.push({
        id: generateId(),
        type: "metrics",
        cards: targetBlocks.metrics.cards.map((m) => ({
          id: m.id || generateId(),
          description: m.description,
          span: m.span || 1,
        })),
      });
    }
  }

  // Если infoBlocks не было, но были legacy highlights
  const highlights = lang === "ru" ? caseData.highlights : caseData.highlights_en;
  if (items.length === 0 && highlights && highlights.length > 0) {
    const validHighlights = highlights.filter((h) => h.title.trim() || h.description.trim());
    if (validHighlights.length > 0) {
      items.push({
        id: generateId(),
        type: "heading",
        title: lang === "ru" ? "Кейс" : "Case",
      });
      validHighlights.forEach((h) => {
        items.push({
          id: generateId(),
          type: "card",
          title: h.title,
          description: h.description,
          fullWidth: false,
        });
      });
    }
  }

  return items;
}

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
    subtitle: "",
    subtitle_en: "",
    description: "",
    description_en: "",
    logo: "",
    accentColor: "#F99B7D",
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
    items: [],
    items_en: [],
  });

  const [activeLang, setActiveLang] = useState<"ru" | "en">("ru");
  const [elementFolders, setElementFolders] = useState<ElementFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [isCustomPath, setIsCustomPath] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
    if (!initialData) return;

    setFormData({
      type: initialData.type || "gallery",
      title: initialData.title,
      title_en: initialData.title_en || "",
      subtitle: initialData.subtitle || (initialData.tags && initialData.tags.length > 0 ? initialData.tags.join(", ") : ""),
      subtitle_en: initialData.subtitle_en || "",
      description: initialData.description,
      description_en: initialData.description_en || "",
      logo: initialData.logo || "",
      accentColor: initialData.accentColor || "#F99B7D",
      date: initialData.date || new Date().toISOString().split("T")[0],
      category: initialData.category,
      coverImage: initialData.coverImage,
      images: initialData.images || [],
      galleryLayout: initialData.galleryLayout || "stack",
      componentUrl: initialData.componentUrl || "",
      tags: initialData.tags || [],
      content: initialData.content || "",
      published: initialData.published,
      featuredOnHome: initialData.featuredOnHome || false,
      items: convertLegacyToItems(initialData, "ru"),
      items_en: convertLegacyToItems(initialData, "en"),
    });

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
        toast.success(`Файл ${file.name} загружен`);
        return data.data.path;
      }
      toast.error(data.error || "Ошибка загрузки файла");
      return null;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Ошибка сети при загрузке файла");
      return null;
    }
  };

  // Загрузка логотипа
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLogoUploading(true);
    const path = await uploadFile(file);
    setIsLogoUploading(false);

    if (path) {
      setFormData((prev) => ({ ...prev, logo: path }));
    }
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  // Загрузка обложки
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCoverUploading(true);
    const path = await uploadFile(file);
    setIsCoverUploading(false);

    if (path) {
      setFormData((prev) => ({ ...prev, coverImage: path }));
    }
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  // Загрузка галереи
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadPromises = Array.from(files).map((file) => uploadFile(file));
    const paths = await Promise.all(uploadPromises);
    const validPaths = paths.filter((p): p is string => p !== null);

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validPaths],
    }));

    setIsUploading(false);
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

  // Работа с лентой элементов
  const currentItems = activeLang === "ru" ? formData.items : formData.items_en;
  const targetItemsField = activeLang === "ru" ? "items" : "items_en";

  const addItem = (type: "heading" | "card" | "metrics" | "preview") => {
    let newItem: CaseItem;
    if (type === "heading") {
      newItem = { id: generateId(), type: "heading", title: "" };
    } else if (type === "card") {
      newItem = { id: generateId(), type: "card", title: "", description: "", fullWidth: false };
    } else if (type === "preview") {
      newItem = {
        id: generateId(),
        type: "preview",
        title: "",
        variant: "tabs",
        interval: 3,
        images: [{ id: generateId(), url: "", title: "" }],
      };
    } else {
      newItem = {
        id: generateId(),
        type: "metrics",
        cards: [
          { id: generateId(), description: "", span: 1 },
          { id: generateId(), description: "", span: 1 },
          { id: generateId(), description: "", span: 1 },
        ],
      };
    }

    setFormData((prev) => ({
      ...prev,
      [targetItemsField]: [...prev[targetItemsField], newItem],
    }));
  };

  const updateItem = (index: number, updatedItem: CaseItem) => {
    setFormData((prev) => {
      const list = [...prev[targetItemsField]];
      list[index] = updatedItem;
      return { ...prev, [targetItemsField]: list };
    });
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      [targetItemsField]: prev[targetItemsField].filter((_, i) => i !== index),
    }));
  };

  const handleReorderItems = (newOrder: CaseItem[]) => {
    setFormData((prev) => ({
      ...prev,
      [targetItemsField]: newOrder,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Тип кейса, Категория и Акцентный цвет */}
      <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
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

        <div className="space-y-2">
          <Label htmlFor="accentColor">Акцентный цвет кейса</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="accentColorPicker"
              value={formData.accentColor && formData.accentColor.startsWith("#") ? formData.accentColor : "#F99B7D"}
              onChange={(e) => setFormData((prev) => ({ ...prev, accentColor: e.target.value }))}
              className="w-10 h-10 rounded-md border border-border cursor-pointer bg-transparent p-1"
            />
            <Input
              id="accentColor"
              value={formData.accentColor || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, accentColor: e.target.value }))}
              placeholder="#F99B7D"
              className="font-mono text-sm"
            />
          </div>
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

      {/* Медиа-блоки: Логотип и Обложка */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
        {/* Логотип кейса */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Логотип кейса</Label>
            <span className="text-xs text-muted-foreground">слева над заголовком</span>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*,.svg"
            onChange={handleLogoUpload}
            className="hidden"
          />

          {formData.logo ? (
            <div className="space-y-2">
              <div className="flex items-center gap-4 bg-muted/30 p-3 border border-border rounded-lg">
                <div className="flex items-center justify-center bg-background border border-border rounded-full w-14 h-14 overflow-hidden shrink-0">
                  <img
                    src={formData.logo}
                    alt="Логотип"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <p className="font-mono text-muted-foreground text-xs truncate">
                    {formData.logo}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isLogoUploading}
                    >
                      Заменить
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2 text-destructive hover:text-destructive"
                      onClick={() => setFormData((prev) => ({ ...prev, logo: "" }))}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={isLogoUploading}
                className="flex flex-col justify-center items-center gap-1.5 border-2 border-border hover:border-primary/50 border-dashed rounded-lg w-full h-[95px] text-muted-foreground hover:text-foreground transition-colors p-2 text-center"
              >
                {isLogoUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-xs">Загрузка...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span className="text-xs font-medium">Выбрать логотип</span>
                    <span className="text-[10px] text-muted-foreground">SVG, PNG, JPG, WebP до 10MB</span>
                  </>
                )}
              </button>
              <Input
                value={formData.logo || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))}
                placeholder="Или путь/URL: /images/logo.svg"
                className="text-xs h-8 font-mono bg-background"
              />
            </div>
          )}
        </div>

        {/* Обложка */}
        <div className="space-y-2 md:col-span-2">
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
              <div className="relative bg-muted border border-border rounded-lg h-[120px] overflow-hidden">
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
              className="flex flex-col justify-center items-center gap-1.5 border-2 border-border hover:border-primary/50 border-dashed rounded-lg w-full h-[120px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {isCoverUploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs">Загрузка...</span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  <span className="text-xs font-medium">Нажмите для выбора обложки</span>
                  <span className="text-[10px] text-muted-foreground">JPG, PNG, WebP до 10MB</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Основные поля и переключатель языка */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
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

        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="subtitle">
              {activeLang === "ru" ? "Текст на карточке" : "Card text"}
            </Label>
            <Input
              id="subtitle"
              value={activeLang === "ru" ? (formData.subtitle || "") : (formData.subtitle_en || "")}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [activeLang === "ru" ? "subtitle" : "subtitle_en"]: e.target.value,
                }))
              }
              placeholder={activeLang === "ru" ? "Например: Productivity, B2C" : "e.g. Productivity, B2C"}
            />
          </div>

          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg h-10 flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveLang("ru")}
              className={`w-10 h-8 flex items-center justify-center rounded-md text-base transition-colors ${
                activeLang === "ru"
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
              className={`w-10 h-8 flex items-center justify-center rounded-md text-base transition-colors ${
                activeLang === "en"
                  ? "bg-background shadow-sm"
                  : "hover:bg-background/50"
              }`}
              title="English"
            >
              🇬🇧
            </button>
          </div>
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
                </div>
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
          rows={5}
          required={activeLang === "ru"}
          className="font-mono text-sm"
        />
      </div>

      {/* НОВАЯ ЛЕНТА ЭЛЕМЕНТОВ (КАРТОЧКИ, ЗАГОЛОВКИ, МЕТРИКИ) */}
      <AnimatePresence mode="wait">
        {formData.type === "gallery" && formData.category === "design" && (
          <motion.div
            key="stream-items-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-2 border-border/50 border-t overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div>
                  <Label className="text-base font-semibold">
                    Карточки и структура кейса ({activeLang.toUpperCase()})
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Добавляйте заголовки, карточки и блоки метрик. Перетаскивайте для изменения порядка.
                  </p>
                </div>

                {/* Кнопки добавления */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addItem("card")}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    + Карточка
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addItem("heading")}
                    className="h-8 text-xs gap-1.5"
                  >
                    <HeadingIcon className="w-3.5 h-3.5 text-primary" />
                    + Заголовок
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addItem("preview")}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    + Превью
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addItem("metrics")}
                    className="h-8 text-xs gap-1.5"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-primary" />
                    + Метрика
                  </Button>
                </div>
              </div>

              {/* Список элементов с Drag & Drop */}
              {currentItems.length === 0 ? (
                <div className="flex flex-col justify-center items-center py-10 border-2 border-border border-dashed rounded-xl text-muted-foreground bg-muted/10">
                  <p className="mb-3 text-sm font-medium">
                    {activeLang === "ru" ? "В кейсе пока нет карточек и заголовков" : "No cards or headings yet"}
                  </p>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <Button type="button" variant="secondary" size="sm" onClick={() => addItem("card")}>
                      <Plus className="mr-1.5 w-3.5 h-3.5" />
                      Добавить карточку
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => addItem("heading")}>
                      <Plus className="mr-1.5 w-3.5 h-3.5" />
                      Добавить заголовок
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => addItem("preview")}>
                      <Plus className="mr-1.5 w-3.5 h-3.5" />
                      Добавить превью
                    </Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => addItem("metrics")}>
                      <Plus className="mr-1.5 w-3.5 h-3.5" />
                      Добавить метрику
                    </Button>
                  </div>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={currentItems}
                  onReorder={handleReorderItems}
                  className="space-y-3"
                >
                  {currentItems.map((item, index) => (
                    <DraggableStreamItem
                      key={item.id || index}
                      item={item}
                      index={index}
                      activeLang={activeLang}
                      uploadFile={uploadFile}
                      onUpdate={(updated) => updateItem(index, updated)}
                      onRemove={() => removeItem(index)}
                    />
                  ))}
                </Reorder.Group>
              )}
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
            className="space-y-4 pt-2 border-border/50 border-t overflow-hidden"
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


      </div>

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

// Универсальный перетаскиваемый элемент ленты
interface DraggableStreamItemProps {
  item: CaseItem;
  index: number;
  activeLang: "ru" | "en";
  uploadFile?: (file: File) => Promise<string | null>;
  onUpdate: (item: CaseItem) => void;
  onRemove: () => void;
}

function DraggableStreamItem({
  item,
  index,
  activeLang,
  uploadFile,
  onUpdate,
  onRemove,
}: DraggableStreamItemProps) {
  const controls = useDragControls();

  if (item.type === "heading") {
    return (
      <Reorder.Item
        value={item}
        dragListener={false}
        dragControls={controls}
        className="bg-muted/40 border border-border hover:border-primary/40 rounded-xl p-4 transition-colors space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex justify-center items-center bg-primary/10 rounded-full w-6 h-6 font-medium text-primary text-xs">
              {index + 1}
            </span>
            <Badge variant="outline" className="bg-background text-xs gap-1 py-0.5">
              <HeadingIcon className="w-3 h-3 text-primary" />
              Заголовок секции (отступ 52px)
            </Badge>
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

        <Input
          value={item.title}
          onChange={(e) => onUpdate({ ...item, title: e.target.value })}
          placeholder={activeLang === "ru" ? "Например: Кейс, Что пошло не так?..." : "e.g. Case, What went wrong?..."}
          className="bg-background font-medium text-sm"
        />
      </Reorder.Item>
    );
  }

  if (item.type === "card") {
    return (
      <Reorder.Item
        value={item}
        dragListener={false}
        dragControls={controls}
        className="bg-muted/30 border border-border hover:border-primary/40 rounded-xl p-4 transition-colors space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex justify-center items-center bg-primary/10 rounded-full w-6 h-6 font-medium text-primary text-xs">
              {index + 1}
            </span>
            <Badge variant="outline" className="bg-background text-xs gap-1 py-0.5">
              <Layers className="w-3 h-3 text-primary" />
              Карточка
            </Badge>
            <label className="flex items-center gap-1.5 text-muted-foreground text-xs cursor-pointer ml-2">
              <input
                type="checkbox"
                checked={item.fullWidth ?? false}
                onChange={(e) => onUpdate({ ...item, fullWidth: e.target.checked })}
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

        <Input
          value={item.title}
          onChange={(e) => onUpdate({ ...item, title: e.target.value })}
          placeholder={activeLang === "ru" ? "Заголовок карточки (например: Ситуация, Задача, Результат)" : "Card title"}
          className="bg-background text-sm font-medium"
        />
        <Textarea
          value={item.description}
          onChange={(e) => onUpdate({ ...item, description: e.target.value })}
          placeholder={activeLang === "ru" ? "Текст и описание карточки..." : "Card description..."}
          rows={3}
          className="bg-background text-sm"
        />
      </Reorder.Item>
    );
  }

  if (item.type === "preview") {
    const updatePreviewImage = (
      imgIndex: number,
      field: keyof PreviewImage,
      value: string
    ) => {
      const updatedImages = [...(item.images || [])];
      updatedImages[imgIndex] = { ...updatedImages[imgIndex], [field]: value };
      onUpdate({ ...item, images: updatedImages });
    };

    const addPreviewImage = () => {
      const updatedImages = [
        ...(item.images || []),
        { id: generateId(), url: "", title: "" },
      ];
      onUpdate({ ...item, images: updatedImages });
    };

    const removePreviewImage = (imgIndex: number) => {
      const updatedImages = (item.images || []).filter((_, i) => i !== imgIndex);
      onUpdate({ ...item, images: updatedImages });
    };

    return (
      <Reorder.Item
        value={item}
        dragListener={false}
        dragControls={controls}
        className="bg-muted/40 border border-border hover:border-primary/40 rounded-xl p-4 transition-colors space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex justify-center items-center bg-primary/10 rounded-full w-6 h-6 font-medium text-primary text-xs">
              {index + 1}
            </span>
            <Badge variant="outline" className="bg-background text-xs gap-1 py-0.5">
              <Eye className="w-3 h-3 text-primary" />
              Превью ({item.variant === "slideshow" ? "Гифка" : "Табы"})
            </Badge>
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

        {/* Заголовок секции и выбор режима */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <div className="md:col-span-2 space-y-1">
            <Label className="text-xs text-muted-foreground">Заголовок секции</Label>
            <Input
              value={item.title}
              onChange={(e) => onUpdate({ ...item, title: e.target.value })}
              placeholder={activeLang === "ru" ? "Например: Превью..." : "e.g. Preview..."}
              className="bg-background font-medium text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Режим переключения</Label>
            <Select
              value={item.variant || "tabs"}
              onValueChange={(val: "tabs" | "slideshow") =>
                onUpdate({ ...item, variant: val })
              }
            >
              <SelectTrigger className="bg-background text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tabs">Табы (по клику)</SelectItem>
                <SelectItem value="slideshow">Гифка (авто)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Настройка интервала для гифки */}
        {item.variant === "slideshow" && (
          <div className="flex items-center gap-3 bg-background/60 p-2.5 rounded-lg border border-border/60">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">
              Интервал смены картинок:
            </Label>
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={item.interval ?? 3}
                onChange={(e) =>
                  onUpdate({ ...item, interval: parseFloat(e.target.value) || 3 })
                }
                className="w-20 h-8 text-xs bg-background"
              />
              <span className="text-xs text-muted-foreground">сек</span>
            </div>
          </div>
        )}

        {/* Список картинок */}
        <div className="space-y-2 bg-background/50 p-3 rounded-lg border border-border/60">
          <Label className="text-xs font-semibold text-muted-foreground">
            Картинки превью ({item.images?.length || 0})
          </Label>

          <div className="space-y-2">
            {(item.images || []).map((img, imgIdx) => (
              <div
                key={img.id || imgIdx}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-background p-2.5 rounded-lg border border-border"
              >
                {/* Превью миниатюра */}
                <div className="w-14 h-14 bg-muted/60 rounded-md border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {img.url ? (
                    <img src={img.url} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </div>

                {/* Название таба */}
                <div className="w-full sm:w-36">
                  <Input
                    value={img.title || ""}
                    onChange={(e) => updatePreviewImage(imgIdx, "title", e.target.value)}
                    placeholder="Таб (APP)..."
                    className="text-xs h-8 bg-background"
                  />
                </div>

                {/* URL картинки */}
                <div className="flex-1 w-full">
                  <Input
                    value={img.url}
                    onChange={(e) => updatePreviewImage(imgIdx, "url", e.target.value)}
                    placeholder="/uploads/preview.png или https://..."
                    className="text-xs h-8 font-mono bg-background"
                  />
                </div>

                {/* Кнопка загрузки файла */}
                <label className="cursor-pointer inline-flex items-center justify-center h-8 px-2.5 text-xs font-medium bg-muted hover:bg-muted/80 rounded-md transition-colors whitespace-nowrap">
                  <Upload className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  Загрузить
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !uploadFile) return;
                      const path = await uploadFile(file);
                      if (path) {
                        updatePreviewImage(imgIdx, "url", path);
                      }
                    }}
                  />
                </label>

                {/* Кнопка удаления */}
                <button
                  type="button"
                  onClick={() => removePreviewImage(imgIdx)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPreviewImage}
            className="w-full text-xs h-8 border-dashed mt-2"
          >
            <Plus className="mr-1.5 w-3.5 h-3.5" />
            Добавить еще картинку
          </Button>
        </div>
      </Reorder.Item>
    );
  }

  // item.type === "metrics"
  const addMetricCard = () => {
    const newCards = [...item.cards, { id: generateId(), description: "", span: 1 as const }];
    onUpdate({ ...item, cards: newCards });
  };

  const updateMetricCard = (cardIndex: number, field: keyof MetricSubCard, value: any) => {
    const newCards = [...item.cards];
    newCards[cardIndex] = { ...newCards[cardIndex], [field]: value };
    onUpdate({ ...item, cards: newCards });
  };

  const removeMetricCard = (cardIndex: number) => {
    const newCards = item.cards.filter((_, i) => i !== cardIndex);
    onUpdate({ ...item, cards: newCards });
  };

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="bg-muted/20 border-2 border-primary/20 hover:border-primary/40 rounded-xl p-4 transition-colors space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex justify-center items-center bg-primary/10 rounded-full w-6 h-6 font-medium text-primary text-xs">
            {index + 1}
          </span>
          <Badge variant="outline" className="bg-background text-xs gap-1 py-0.5">
            <BarChart2 className="w-3 h-3 text-primary" />
            Блок метрик ({item.cards.length} микрокарточек)
          </Badge>
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

      {/* Список микрокарточек метрик */}
      <div className="space-y-2.5 bg-background/50 p-3 rounded-lg border border-border/60">
        <div className="gap-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {item.cards.map((metric, mIndex) => (
            <div
              key={metric.id || mIndex}
              className="bg-background p-3 rounded-lg border border-border space-y-2 relative group/metric"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Метрика #{mIndex + 1}
                </span>
                <div className="flex items-center gap-1.5">
                  <Select
                    value={String(metric.span || 1)}
                    onValueChange={(val) =>
                      updateMetricCard(mIndex, "span", Number(val) as 1 | 2 | 3)
                    }
                  >
                    <SelectTrigger className="h-6 w-16 text-[11px] px-1.5 bg-muted/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1/3</SelectItem>
                      <SelectItem value="2">2/3</SelectItem>
                      <SelectItem value="3">3/3</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => removeMetricCard(mIndex)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <Textarea
                value={metric.description}
                onChange={(e) => updateMetricCard(mIndex, "description", e.target.value)}
                placeholder={activeLang === "ru" ? "TTG: < 12 ч или CSI: +3.7" : "TTG: < 12 h"}
                rows={2}
                className="text-xs resize-none"
              />
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addMetricCard}
          className="w-full text-xs h-8 border-dashed"
        >
          <Plus className="mr-1.5 w-3.5 h-3.5" />
          Добавить микрокарточку метрики
        </Button>
      </div>
    </Reorder.Item>
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
        <div className="flex-shrink-0 bg-muted rounded-md w-16 h-16 overflow-hidden">
          <img
            src={image}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-muted-foreground text-xs truncate">
            {image.split("/").pop()}
          </p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="hover:bg-destructive/10 p-1.5 rounded-md text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

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
