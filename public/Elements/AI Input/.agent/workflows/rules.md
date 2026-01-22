---
description: 
---

Правила разработки проекта 

1. Стек технологий
Core: React (v18+)
Стилизация: Tailwind CSS
UI Kit: shadcn/ui (Radix UI под капотом)
Иконки: Lucide React
Анимация: Framer Motion
Язык: TypeScript (строго рекомендуется для типизации пропсов shadcn)

2. Структура проекта
Мы придерживаемся модульной структуры, разделяя UI-компоненты и бизнес-логику.

Plaintext

src/
├── components/
│   ├── ui/           # Базовые компоненты shadcn (Button, Card, Input...)
│   ├── shared/       # Переиспользуемые блоки (Header, Footer)
│   └── features/     # Сложные компоненты, специфичные для конкретных фич
├── hooks/            # Кастомные хуки (useGravity, useScrollPosition)
├── lib/
│   ├── utils.ts      # Утилита cn() для слияния классов (обязательно!)
│   └── animation.ts  # Глобальные настройки анимаций Framer Motion
├── assets/           # Изображения и статика
├── layouts/          # Обертки страниц
└── pages/            # Страницы приложения

3. Компоненты и JSX
Именование
Компоненты: PascalCase (например, GravityButton.tsx).

Папки компонентов: PascalCase (например, components/GravityButton/).

Хуки: camelCase, префикс use (например, useLevitation.ts).

Правила написания
Функциональный стиль: Используем только const Component = () => {}.

Типизация: Все пропсы должны быть типизированы через интерфейс interface Props.

Экспорт: Используем Named Exports для компонентов (кроме страниц Next.js/Remix).

TypeScript

// Good
export const GravityCard = () => { ... }
4. Стилизация (Tailwind CSS + shadcn/ui)
Использование классов
Избегаем использования @apply в CSS файлах. Пишем классы прямо в JSX.

Соблюдаем логический порядок классов (рекомендуется плагин prettier-plugin-tailwindcss).

Объединение классов (cn)
Для условного рендеринга стилей и мерджа классов shadcn используем утилиту cn (clsx + tw-merge).

TypeScript

import { cn } from "@/lib/utils"

// Правильно: позволяет переопределить bg-black при вызове компонента
<div className={cn("bg-black p-4 rounded-xl transition-all", className)}>
  {children}
</div>
Shadcn UI
Не меняем код внутри components/ui без крайней необходимости.

Кастомизацию темы проводим через tailwind.config.js и CSS переменные в globals.css.

5. Иконки (Lucide React)
Импортируем иконки точечно, чтобы не раздувать бандл.

Стараемся задавать размер и цвет через классы Tailwind родителя или пропсы className.

TypeScript

import { Rocket } from 'lucide-react';

<Rocket className="w-6 h-6 text-primary hover:text-accent" />
6. Анимация (Framer Motion)
Так как проект "Антигравити", анимации критически важны.

Принципы
Вынос вариантов: Храним объекты variants вне компонента или в отдельном файле animations.ts, если они большие.

Performance: Анимируем только дешевые свойства: opacity, transform (translate, scale, rotate). Избегаем анимации width, height, top, left.

Layout Animations: Используем проп layout для плавного изменения размеров списков/карточек.

Пример паттерна
TypeScript

import { motion } from "framer-motion";

const floatVariants = {
  initial: { y: 0 },
  animate: { 
    y: [0, -20, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  }
};

export const FloatingElement = ({ children }) => (
  <motion.div 
    variants={floatVariants}
    initial="initial"
    animate="animate"
  >
    {children}
  </motion.div>
);
7. Git и Workflow (Conventional Commits)
Используем префиксы для коммитов:

feat: — новая функциональность (добавил компонент кнопки)

fix: — исправление бага

style: — правки стилей (Tailwind), форматирование

refactor: — рефакторинг кода без изменения логики

chore: — обновление зависимостей, конфигов

Пример: feat: добавить анимацию невесомости для хедера