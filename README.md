# Трастмаркет (TrustMarket)

Лендинг пейдж для trust-first российской электронной классифайд-платформы.

## О проекте

**Трастмаркет** — первая верифицированная площадка для покупки и продажи электроники в России. Ключевые отличия от Авито:
- Верификация продавцов через Госуслуги
- Эскроу-сделки (защита покупателя)
- Человеческая модерация объявлений

## Технологический стек

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React 18**

## Требования

- Node.js 18+
- npm или yarn

## Установка

```bash
# Клонировать репозиторий
cd trustmarket

# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev
```

## Доступ

После запуска откройте http://localhost:3000

## Структура проекта

```
trustmarket/
├── app/
│   ├── globals.css    # Глобальные стили
│   ├── layout.tsx    # Корневой layout
│   └── page.tsx      # Главная страница
├── public/           # Статические файлы
├── package.json      # Зависимости
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Кастомизация

### Цвета

Цвета настроены в `tailwind.config.ts`:
- `trust-*` — глубокий синий (primary)
- `accent-*` — зелёный (trust/success)

### Контент

Редактируйте текст в `app/page.tsx`:
- Заголовки и подзаголовки
- Описание преимуществ
- Текст формы waitlist
- Отзывы (placeholder)

## Деплой

### Vercel (рекомендуется)

```bash
npm i -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## TODO

- [ ] Подключить реальный API для waitlist
- [ ] Добавить аналитику (Google Analytics, Yandex Metrika)
- [ ] Добавить политику конфиденциальности
- [ ] Мультиязычность (ENG вариант)
- [ ] SEO оптимизация

## Лицензия

MIT
