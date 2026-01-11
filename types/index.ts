// Тип кейса
export type CaseType = "gallery" | "component";

// Тип отображения галереи
export type GalleryLayout = "stack" | "masonry";

// Интерфейс кейса портфолио
export interface Case {
  id: string;
  slug: string;
  type: CaseType;
  title: string;
  description: string;
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
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Данные для создания нового кейса
export interface CreateCaseData {
  type: CaseType;
  title: string;
  description: string;
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
}

// Данные для обновления кейса
export interface UpdateCaseData {
  type?: CaseType;
  title?: string;
  slug?: string;
  description?: string;
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
}

// Тип для обновления порядка на главной
export interface HomeOrderUpdate {
  id: string;
  homeOrder: number | null;
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

// Категории кейсов
export type CaseCategory = "design" | "development" | "branding" | "other";

// Статус публикации
export type PublishStatus = "published" | "draft";
