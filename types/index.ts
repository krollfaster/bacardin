// Тип кейса
export type CaseType = "gallery" | "component";

// Тип отображения галереи
export type GalleryLayout = "stack" | "masonry";

// Карточка хайлайта (инфографика)
export interface HighlightCard {
  title: string;
  description: string;
}

// Интерфейс кейса портфолио
export interface Case {
  id: string;
  slug: string;
  type: CaseType;
  title: string;
  title_en?: string; // Английская версия названия
  description: string;
  description_en?: string; // Английская версия описания
  date: string; // Дата кейса
  category: string;
  coverImage: string;
  // Для галереи
  images: string[];
  galleryLayout?: GalleryLayout; // "stack" по умолчанию
  // Для компонента (iframe URL)
  componentUrl?: string;
  tags: string[];
  content: string; // Markdown или HTML
  published: boolean;
  featuredOnHome: boolean; // @deprecated - используйте homeOrder
  homeOrder: number | null; // null = не показывать, 1-6 = позиция на главной
  vibecodeOrder: number | null; // null = без сортировки, 1+ = позиция на странице /cases
  highlights?: HighlightCard[]; // Карточки хайлайтов для галереи
  highlights_en?: HighlightCard[]; // Английская версия хайлайтов
  highlightFooter?: string; // Подпись под хайлайтами RU
  highlightFooter_en?: string; // Подпись под хайлайтами EN
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Данные для создания нового кейса
export interface CreateCaseData {
  type: CaseType;
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  date: string;
  category: string;
  coverImage: string;
  images?: string[];
  galleryLayout?: GalleryLayout;
  componentUrl?: string;
  tags?: string[];
  content: string;
  published?: boolean;
  featuredOnHome?: boolean;
  homeOrder?: number | null;
  vibecodeOrder?: number | null;
  highlights?: HighlightCard[];
  highlights_en?: HighlightCard[];
  highlightFooter?: string;
  highlightFooter_en?: string;
}

// Данные для обновления кейса
export interface UpdateCaseData {
  type?: CaseType;
  title?: string;
  title_en?: string;
  slug?: string;
  description?: string;
  description_en?: string;
  date?: string;
  category?: string;
  coverImage?: string;
  images?: string[];
  galleryLayout?: GalleryLayout;
  componentUrl?: string;
  tags?: string[];
  content?: string;
  published?: boolean;
  featuredOnHome?: boolean;
  homeOrder?: number | null;
  vibecodeOrder?: number | null;
  highlights?: HighlightCard[];
  highlights_en?: HighlightCard[];
  highlightFooter?: string;
  highlightFooter_en?: string;
}

// Тип для обновления порядка на главной
export interface HomeOrderUpdate {
  id: string;
  homeOrder: number | null;
}

// Тип для обновления порядка на странице /cases
export interface VibecodeOrderUpdate {
  id: string;
  vibecodeOrder: number | null;
}

// Ответ API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Данные авторизации
export interface AuthData {
  password: string;
}

// Категория кейса (определяет где показывается)
export type CaseCategory = "design" | "vibecode";

// Статус публикации
export type PublishStatus = "published" | "draft";
