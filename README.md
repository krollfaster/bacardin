# Bacardin Portfolio

Современное портфолио разработчика/дизайнера на Next.js 16 с темной темой и анимациями.

## Технологии

- **Next.js 16** — App Router, Server Components
- **TypeScript** — типизация
- **Tailwind CSS v4** — стилизация
- **shadcn/ui** — UI компоненты
- **Framer Motion** — анимации
- **Space Grotesk** — основной шрифт

## Начало работы

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшен сервера
npm start
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Переменные окружения

Создайте файл `.env.local` на основе `.env.example`:

```env
ADMIN_PASSWORD=your_secure_password
```

## Структура проекта

```
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # Авторизация
│   │   └── cases/        # CRUD кейсов
│   ├── globals.css       # Глобальные стили
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Главная страница
├── components/
│   └── ui/               # shadcn/ui компоненты
├── lib/
│   ├── animations.ts     # Framer Motion варианты
│   ├── auth.ts           # Авторизация
│   ├── cases.ts          # CRUD операции
│   └── utils.ts          # Утилиты (cn)
├── types/
│   └── index.ts          # TypeScript интерфейсы
├── data/
│   └── cases.json        # Хранилище кейсов
├── public/
│   └── images/cases/     # Изображения кейсов
└── middleware.ts         # Защита /admin
```

## API Endpoints

### Авторизация

- `POST /api/auth` — вход (body: `{ password }`)
- `DELETE /api/auth` — выход

### Кейсы

- `GET /api/cases` — получить опубликованные кейсы
- `GET /api/cases?all=true` — все кейсы (требуется авторизация)
- `POST /api/cases` — создать кейс (требуется авторизация)
- `GET /api/cases/[id]` — получить кейс по ID
- `PUT /api/cases/[id]` — обновить кейс (требуется авторизация)
- `DELETE /api/cases/[id]` — удалить кейс (требуется авторизация)

## Лицензия

MIT
