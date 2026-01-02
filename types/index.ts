// Интерфейс кейса портфолио
export interface Case {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  coverImage: string;
  images: string[];
  tags: string[];
  content: string; // Markdown или HTML
  published: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Данные для создания нового кейса
export interface CreateCaseData {
  title: string;
  description: string;
  category: string;
  coverImage: string;
  images?: string[];
  tags?: string[];
  content: string;
  published?: boolean;
}

// Данные для обновления кейса
export interface UpdateCaseData {
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  coverImage?: string;
  images?: string[];
  tags?: string[];
  content?: string;
  published?: boolean;
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

