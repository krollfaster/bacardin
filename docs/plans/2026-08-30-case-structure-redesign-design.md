# Дизайн новой структуры кейсов (Админка + Просмотр кейса)

**Дата:** 30 августа 2026  
**Ветка:** `feature/update-hero-profile`  
**Автор:** Antigravity & Ernest von Schuldiais  

---

## 1. Контекст и цели

Текущая модель кейсов использует фиксированные инфоблоки с жестко заданными табами (*Контекст, Действия, Влияние, Метрики*). Это ограничивает гибкость повествования в портфолио.

**Цель:**
Перейти от фиксированных вкладок инфоблоков к гибкой **ленте контентных элементов (Flow/Stream)**, где пользователь может свободно комбинировать:
1. **Логотип кейса (Logo):** отображается над заголовком кейса.
2. **Заголовки секций (Section Headings):** промежуточные заголовки (например, «Кейс», «Что пошло не так?») с верхним отступом `56px`.
3. **Обычные карточки (Cards):** заголовок + описание + настройка ширины (`fullWidth`).
4. **Блоки метрик (Metrics Group):** карточка-контейнер, содержащая микрокарточки с метриками (`description`, `span: 1|2|3`).

Все базовые настройки кейса (*Тип кейса, Категория, Вид галереи, Обложка, Галерея картинок, RU/EN локализация*) сохраняются.

---

## 2. Архитектура данных (TypeScript & Data Model)

### Модели элементов:
```typescript
// Заголовок секции между карточками
export interface CaseHeadingItem {
  id: string;
  type: "heading";
  title: string;
}

// Стандартная карточка контента
export interface CaseCardItem {
  id: string;
  type: "card";
  title: string;
  description: string;
  fullWidth?: boolean;
}

// Карточка метрики (микрокарточка внутри группы метрик)
export interface MetricSubCard {
  id?: string;
  description: string;
  span?: 1 | 2 | 3;
}

// Блок/Группа метрик
export interface CaseMetricsItem {
  id: string;
  type: "metrics";
  cards: MetricSubCard[];
}

// Полиморфный элемент ленты кейса
export type CaseItem = CaseHeadingItem | CaseCardItem | CaseMetricsItem;
```

### Обновление интерфейса `Case`:
```typescript
export interface Case {
  id: string;
  slug: string;
  type: CaseType;
  category: string;
  galleryLayout?: GalleryLayout;
  
  // Логотип кейса (НОВОЕ)
  logo?: string;
  
  coverImage: string;
  images: string[];
  componentUrl?: string;
  
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  
  // Новая гибкая лента элементов (заменяет жесткие infoBlocks)
  items?: CaseItem[];
  items_en?: CaseItem[];
  
  // Legacy-поля сохраняем для бесшовной обратной совместимости
  infoBlocks?: InfoBlocks;
  infoBlocks_en?: InfoBlocks;
  highlights?: HighlightCard[];
  highlights_en?: HighlightCard[];
  highlightFooter?: string;
  highlightFooter_en?: string;
  
  tags: string[];
  published: boolean;
  homeOrder: number | null;
  vibecodeOrder: number | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 3. Админ-панель (`CaseForm.tsx`)

1. **Блок метаданных и логотипа:**
   - Поле загрузки `logo` рядом с `coverImage` (с предпросмотром, заменой и удалением).
2. **Редактор ленты элементов:**
   - Переключение языков (🇷🇺 RU / 🇬🇧 EN).
   - Единый Drag-and-Drop список (`framer-motion` `Reorder.Group`).
   - Панель добавления:
     - `+ Добавить карточку`
     - `+ Добавить заголовок`
     - `+ Добавить метрики`
   - Инлайн-редактирование каждого типа элемента:
     - **Заголовок:** поле ввода текста.
     - **Карточка:** заголовок, описание, чекбокс «Во всю ширину».
     - **Метрики:** контейнер со списком микрокарточек (`span` 1, 2, 3 и текст), кнопка добавления микрокарточки.

---

## 4. Отображение кейса (`GalleryCaseView.tsx`)

- **Логотип:** рендерится над `h1` заголовком кейса.
- **Лента элементов:** последовательный рендеринг:
  - `heading`: `mt-[56px] mb-[32px] font-medium text-[28px] text-[#9C9C9C]`
  - `card`: карточки в сетке (с группировкой по `fullWidth` / по 2 в ряд).
  - `metrics`: сетка микрокарточек метрик (3 колонки с поддержкой `col-span-1/2/3`).
- **Кнопка/Футер:** стилизованный блок («Появился вопрос?»).
- **Галерея изображений:** `stack` или `masonry`.
