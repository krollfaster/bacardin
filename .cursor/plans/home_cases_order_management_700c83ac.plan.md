---
name: Home Cases Order Management
overview: Заменить чекбокс "На главной" на отдельную секцию в админке с drag-and-drop сортировкой кейсов для главной страницы (до 6 штук).
todos:
  - id: update-types
    content: Добавить поле homeOrder в интерфейс Case и связанные типы
    status: completed
  - id: create-home-order-manager
    content: Создать компонент HomeOrderManager с drag-and-drop (Framer Motion Reorder)
    status: completed
  - id: create-api-endpoint
    content: Создать API endpoint PUT /api/cases/home-order для сохранения порядка
    status: completed
  - id: update-cases-lib
    content: Обновить getFeaturedCases() для сортировки по homeOrder
    status: completed
  - id: update-case-form
    content: Удалить чекбокс featuredOnHome из CaseForm
    status: completed
  - id: update-admin-page
    content: Интегрировать HomeOrderManager в страницу админки
    status: completed
---

# Управление порядком кейсов на главной

## Архитектура изменений

```mermaid
flowchart LR
    subgraph admin [Admin Panel]
        CaseForm[CaseForm - удаляем featuredOnHome]
        HomeOrderManager[HomeOrderManager - новый компонент]
    end
    subgraph data [Data Layer]
        Types[types/index.ts - добавляем homeOrder]
        CasesLib[lib/cases.ts - сортировка по homeOrder]
        API[api/cases/home-order - новый endpoint]
    end
    HomeOrderManager --> API
    API --> CasesLib
```

## 1. Изменение типов данных

В [types/index.ts](types/index.ts) добавить поле:

```typescript
export interface Case {
  // ... existing fields ...
  homeOrder: number | null; // null = не показывать, 1-6 = позиция на главной
}
```

- `featuredOnHome` оставляем для обратной совместимости (deprecated), но используем `homeOrder`

## 2. Создание компонента HomeOrderManager

Новый файл `components/admin/HomeOrderManager.tsx`:
- Использует Framer Motion `Reorder.Group` и `Reorder.Item`
- Показывает 2 колонки: "На главной" (до 6 кейсов) и "Доступные кейсы"
- Drag-and-drop между колонками и внутри "На главной" для сортировки
- Кнопка сохранения порядка

## 3. Новый API endpoint

Файл `app/api/cases/home-order/route.ts`:
- PUT endpoint для массового обновления `homeOrder` у кейсов
- Принимает массив `{ id: string, homeOrder: number | null }[]`

## 4. Обновление lib/cases.ts

Функция `getFeaturedCases()`:

```typescript
export async function getFeaturedCases(): Promise<Case[]> {
  const cases = await getAllCases();
  return cases
    .filter((c) => c.published && c.homeOrder !== null && c.homeOrder > 0)
    .sort((a, b) => (a.homeOrder ?? 99) - (b.homeOrder ?? 99));
}
```

## 5. Изменения в CaseForm

В [components/admin/CaseForm.tsx](components/admin/CaseForm.tsx):
- Удаляем чекбокс `featuredOnHome` (строки 620-634)
- Поле управляется только через HomeOrderManager

## 6. Обновление страницы админки

В [app/[locale]/admin/page.tsx](app/[locale]/admin/page.tsx):
- Добавить вкладку/секцию "Главная страница" с HomeOrderManager

## Миграция данных

При первом запуске нужно будет вручную расставить порядок для существующих кейсов, или автоматически назначить `homeOrder` на основе текущего `featuredOnHome`.