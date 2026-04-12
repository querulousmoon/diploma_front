# Server Monitoring Frontend

Веб-приложение для мониторинга серверов, построенное на React + TypeScript + Vite.

## Возможности Sprint 1

- Авторизация пользователей
- Просмотр списка серверов
- Добавление и редактирование серверов
- Детальная информация о сервере
- Dashboard с общей статистикой
- Просмотр метрик (CPU, RAM, Disk, Network)
- Просмотр списка контейнеров

## Технологический стек

- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик и dev server
- **React Router** - маршрутизация
- **Axios** - HTTP клиент
- **Lucide React** - иконки

## Структура проекта

```
src/
├── api/              # API клиенты
│   ├── auth.ts
│   └── servers.ts
├── components/       # React компоненты
│   ├── layout/       # Layout компоненты
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── ui/           # Переиспользуемые UI компоненты
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── LoadingState.tsx
│   │   └── Spinner.tsx
│   ├── ProtectedRoute.tsx
│   └── ServerForm.tsx
├── contexts/         # React контексты
│   └── AuthContext.tsx
├── lib/              # Утилиты и библиотеки
│   └── api-client.ts
├── pages/            # Страницы приложения
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── ServersListPage.tsx
│   ├── ServerDetailsPage.tsx
│   ├── CreateServerPage.tsx
│   └── EditServerPage.tsx
├── routes/           # Конфигурация маршрутов
│   └── index.tsx
├── types/            # TypeScript типы
│   └── index.ts
├── utils/            # Вспомогательные функции
│   └── formatters.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Установка и запуск

### Требования

- Node.js 18+
- npm или yarn

### Установка зависимостей

```bash
npm install
```

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

### Сборка для production

```bash
npm run build
```

### Предварительный просмотр production сборки

```bash
npm run preview
```

## API интеграция

Приложение ожидает следующие эндпоинты на backend:

### Авторизация

- `POST /api/auth/login` - вход в систему
- `GET /api/auth/me` - получение текущего пользователя

### Серверы

- `GET /api/servers` - список серверов
- `GET /api/servers/:id` - детали сервера
- `POST /api/servers` - создание сервера
- `PUT /api/servers/:id` - обновление сервера
- `DELETE /api/servers/:id` - удаление сервера
- `GET /api/servers/stats/dashboard` - статистика для dashboard

## Архитектурные решения

### Аутентификация

- JWT токен хранится в localStorage
- Автоматическое добавление токена в заголовки запросов
- Автоматический редирект на /login при 401 ошибке
- Protected routes для защищенных страниц

### Управление состоянием

- React Context для глобального состояния (auth)
- Local state для компонентов
- Нет Redux - для Sprint 1 не требуется

### Стилизация

- Vanilla CSS с CSS переменными
- Темная тема по умолчанию
- Модульные CSS файлы для каждого компонента
- Responsive design

### Типизация

- Строгая типизация TypeScript
- Интерфейсы для всех API моделей
- Type-safe API клиенты

## Расширяемость

Архитектура подготовлена для добавления в будущих спринтах:

- Alerts страница
- Anomalies страница
- Web Console
- Settings страница
- Advanced фильтры
- Real-time обновления (WebSocket)
- Графики с историей метрик

## Основные компоненты

### AuthContext

Управляет состоянием аутентификации:
- Хранение информации о пользователе
- Login/logout функции
- Проверка авторизации

### ProtectedRoute

Защищает маршруты от неавторизованных пользователей.

### API Client

Централизованный HTTP клиент с:
- Автоматическим добавлением токена
- Обработкой ошибок
- Типизированными методами

### UI Components

Переиспользуемые компоненты:
- Badge - для статусов и меток
- Card - контейнер для контента
- LoadingState - индикатор загрузки
- ErrorState - отображение ошибок
- EmptyState - пустые состояния

## Соглашения о коде

- Функциональные компоненты с хуками
- TypeScript strict mode
- CSS modules для изоляции стилей
- Именование файлов: PascalCase для компонентов, camelCase для утилит
- Экспорт по умолчанию для компонентов

## Troubleshooting

### CORS ошибки

Убедитесь, что backend настроен для приема запросов с http://localhost:3000

### 401 ошибки

Проверьте, что токен корректно сохраняется в localStorage и добавляется в заголовки запросов.

### Proxy не работает

Vite proxy настроен в `vite.config.ts`. Убедитесь, что backend запущен на порту 8000.

## Лицензия

MIT
