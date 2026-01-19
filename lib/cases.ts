import { promises as fs } from "fs";
import path from "path";
import type { Case, CreateCaseData, UpdateCaseData, HomeOrderUpdate } from "@/types";

const DATA_FILE = path.join(process.cwd(), "data", "cases.json");

// Генерация уникального ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Таблица транслитерации русских букв
const translitMap: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

// Генерация slug из заголовка с транслитерацией
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .split("")
    .map((char) => translitMap[char] ?? char)
    .join("")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Чтение всех кейсов
export async function getAllCases(): Promise<Case[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data) as Case[];
  } catch {
    return [];
  }
}

// Получение опубликованных кейсов
export async function getPublishedCases(): Promise<Case[]> {
  const cases = await getAllCases();
  return cases.filter((c) => c.published);
}

// Получение кейсов для главной страницы (только design с homeOrder)
export async function getFeaturedCases(): Promise<Case[]> {
  const cases = await getAllCases();
  return cases
    .filter((c) => c.published && c.category === "design" && c.homeOrder !== null && c.homeOrder > 0)
    .sort((a, b) => (a.homeOrder ?? 99) - (b.homeOrder ?? 99));
}

// Получение вайбкод кейсов (для страницы /cases)
export async function getVibecodeCases(): Promise<Case[]> {
  const cases = await getAllCases();
  return cases.filter((c) => c.published && c.category === "vibecode");
}

// Получение кейса по ID
export async function getCaseById(id: string): Promise<Case | null> {
  const cases = await getAllCases();
  return cases.find((c) => c.id === id) || null;
}

// Получение кейса по slug
export async function getCaseBySlug(slug: string): Promise<Case | null> {
  const cases = await getAllCases();
  return cases.find((c) => c.slug === slug) || null;
}

// Создание нового кейса
export async function createCase(data: CreateCaseData): Promise<Case> {
  const cases = await getAllCases();
  const now = new Date().toISOString();

  const newCase: Case = {
    id: generateId(),
    slug: generateSlug(data.title),
    type: data.type,
    title: data.title,
    description: data.description,
    date: data.date,
    category: data.category,
    coverImage: data.coverImage,
    images: data.images || [],
    galleryLayout: data.galleryLayout ?? "stack",
    componentUrl: data.componentUrl,
    tags: data.tags || [],
    content: data.content,
    published: data.published ?? false,
    featuredOnHome: data.featuredOnHome ?? false,
    homeOrder: data.homeOrder ?? null,
    createdAt: now,
    updatedAt: now,
  };

  cases.push(newCase);
  await saveCases(cases);

  return newCase;
}

// Обновление кейса
export async function updateCase(
  id: string,
  data: UpdateCaseData
): Promise<Case | null> {
  const cases = await getAllCases();
  const index = cases.findIndex((c) => c.id === id);

  if (index === -1) return null;

  const updatedCase: Case = {
    ...cases[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  // Обновляем slug если изменился title
  if (data.title && !data.slug) {
    updatedCase.slug = generateSlug(data.title);
  }

  cases[index] = updatedCase;
  await saveCases(cases);

  return updatedCase;
}

// Удаление кейса
export async function deleteCase(id: string): Promise<boolean> {
  const cases = await getAllCases();
  const filteredCases = cases.filter((c) => c.id !== id);

  if (filteredCases.length === cases.length) return false;

  await saveCases(filteredCases);
  return true;
}

// Массовое обновление порядка на главной
export async function updateHomeOrder(updates: HomeOrderUpdate[]): Promise<boolean> {
  const cases = await getAllCases();
  const now = new Date().toISOString();

  for (const update of updates) {
    const index = cases.findIndex((c) => c.id === update.id);
    if (index !== -1) {
      cases[index].homeOrder = update.homeOrder;
      cases[index].featuredOnHome = update.homeOrder !== null && update.homeOrder > 0;
      cases[index].updatedAt = now;
    }
  }

  await saveCases(cases);
  return true;
}

// Сохранение кейсов в файл
async function saveCases(cases: Case[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(cases, null, 2), "utf-8");
}
