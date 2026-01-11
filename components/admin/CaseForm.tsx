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
  GripVertical
} from "lucide-react";
import type { Case, CaseType, GalleryLayout } from "@/types";
import { LayoutList, LayoutGrid } from "lucide-react";

interface CaseFormProps {
  initialData?: Case | null;
  onSubmit: (data: CaseFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface CaseFormData {
  type: CaseType;
  title: string;
  description: string;
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
}

interface ElementFolder {
  name: string;
  path: string;
}

const CUSTOM_PATH_VALUE = "__custom__";

export function CaseForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: CaseFormProps) {
  const [formData, setFormData] = useState<CaseFormData>({
    type: "gallery",
    title: "",
    description: "",
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
  });

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
        description: initialData.description,
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
      {/* Тип кейса */}
      <div className="space-y-2">
        <Label>Тип кейса</Label>
        <Select
          value={formData.type}
          onValueChange={(value: CaseType) =>
            setFormData((prev) => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger>
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

      {/* Основные поля */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Название *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Название кейса"
            required
          />
        </div>
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

      {/* Описание */}
      <div className="space-y-2">
        <Label htmlFor="description">Описание *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Краткое описание кейса"
          rows={3}
          required
        />
      </div>

      {/* Категория */}
      <div className="space-y-2">
        <Label>Категория</Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, category: value }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="design">Дизайн</SelectItem>
            <SelectItem value="development">Разработка</SelectItem>
            <SelectItem value="branding">Брендинг</SelectItem>
            <SelectItem value="other">Другое</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
          <div className="relative group">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
              <img
                src={formData.coverImage}
                alt="Обложка"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
            className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
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
                <span className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP до 10MB</span>
              </>
            )}
          </button>
        )}
      </div>

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
            {/* Вид отображения галереи */}
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
              <p className="text-xs text-muted-foreground">
                Стек — картинки друг под другом. Сетка — в колонках с разной высотой.
              </p>
            </div>

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
                className="w-full p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
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
                  <p className="text-xs text-muted-foreground mb-2">
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

        {/* Поля для типа Компонент */}
        {formData.type === "component" && (
          <motion.div
            key="component-fields"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Выбор папки из Elements */}
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
              <p className="text-xs text-muted-foreground">
                Выберите папку проекта из Elements или укажите свой путь
              </p>
            </div>

            {/* Кастомный путь */}
            <AnimatePresence>
              {isCustomPath && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
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
                    placeholder="/Elements/MyWidget или https://example.com/widget"
                  />
                  <p className="text-xs text-muted-foreground">
                    Укажите путь к папке или внешний URL для iframe
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Отображение выбранного пути */}
            {!isCustomPath && selectedFolder && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                <Folder className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono">{selectedFolder}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Контент */}
      <div className="space-y-2">
        <Label htmlFor="content">Контент (Markdown)</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
          placeholder="# Заголовок&#10;&#10;Описание проекта..."
          rows={6}
          className="font-mono text-sm"
        />
      </div>

      {/* Публикация */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="published"
          checked={formData.published}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, published: e.target.checked }))
          }
          className="w-4 h-4 rounded border-border"
        />
        <Label htmlFor="published" className="cursor-pointer">
          Опубликовать кейс
        </Label>
      </div>

      {/* Кнопки */}
      <div className="flex justify-end gap-3 pt-4">
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
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
          ) : initialData ? (
            "Сохранить"
          ) : (
            "Создать"
          )}
        </Button>
      </div>
    </form>
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
      <div className="flex items-center gap-3 p-2 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors">
        {/* Превью изображения */}
        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
          <img
            src={image}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Путь к файлу */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate font-mono">
            {image.split('/').pop()}
          </p>
        </div>

        {/* Кнопка удаления */}
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ручка перетаскивания */}
        <div
          onPointerDown={(e) => controls.start(e)}
          className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted rounded-md"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </Reorder.Item>
  );
}
