# 🚀 Quick Start Guide

## Для разработчиков

### Минимальные требования
- Node.js 18+
- npm или yarn
- Backend API запущен на http://localhost:8000

### Запуск за 3 шага

```bash
# 1. Установка
npm install

# 2. Настройка
cp .env.example .env

# 3. Запуск
npm run dev
```

Откройте http://localhost:3000

### Тестовые данные

Для тестирования используйте:
- Username: `admin` (или любой username из вашего backend)
- Password: `admin123` (или соответствующий пароль)

(Убедитесь, что backend настроен с этими credentials)

## Структура проекта

```
diploma_front/
├── src/
│   ├── api/              # API клиенты
│   ├── components/       # React компоненты
│   ├── contexts/         # Глобальное состояние
│   ├── pages/            # Страницы
│   ├── routes/           # Routing
│   ├── types/            # TypeScript типы
│   └── utils/            # Утилиты
├── .env.example          # Пример конфигурации
├── package.json          # Зависимости
├── vite.config.ts        # Vite конфигурация
└── README.md             # Документация
```

## Основные команды

```bash
# Разработка
npm run dev              # Запуск dev server на :3000

# Production
npm run build            # Сборка для production
npm run preview          # Предпросмотр production сборки

# Качество кода
npm run lint             # Проверка ESLint
```

## Основные страницы

После запуска доступны:

- `/login` - Авторизация
- `/dashboard` - Главная панель
- `/servers` - Список серверов
- `/servers/new` - Добавить сервер
- `/servers/:id` - Детали сервера
- `/servers/:id/edit` - Редактировать сервер

## API Endpoints

Backend должен предоставлять:

```
POST   /api/auth/login
GET    /api/auth/me
GET    /api/servers
POST   /api/servers
GET    /api/servers/:id
PUT    /api/servers/:id
DELETE /api/servers/:id
GET    /api/servers/stats/dashboard
```

## Переменные окружения

Создайте `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Для production:

```env
VITE_API_BASE_URL=https://your-api.com/api
```

## Troubleshooting

### Проблема: npm install не работает

**Решение**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Проблема: CORS ошибки

**Решение**: Убедитесь, что backend настроен для CORS:
```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Проблема: 401 Unauthorized

**Решение**: Проверьте:
1. Backend запущен
2. Credentials правильные
3. Токен сохраняется в localStorage

### Проблема: Страница не загружается

**Решение**:
1. Проверьте консоль браузера
2. Проверьте Network tab
3. Убедитесь, что API доступен

## Разработка

### Добавление новой страницы

1. Создайте компонент в `src/pages/`:
```tsx
// src/pages/NewPage.tsx
export default function NewPage() {
  return <div>New Page</div>
}
```

2. Добавьте route в `src/routes/index.tsx`:
```tsx
<Route path="/new" element={<NewPage />} />
```

3. Добавьте ссылку в `src/components/layout/Sidebar.tsx`

### Добавление нового API endpoint

1. Добавьте функцию в `src/api/`:
```tsx
// src/api/servers.ts
export const serversApi = {
  // ...
  newMethod: async () => {
    const response = await apiClient.get('/new-endpoint')
    return response.data
  }
}
```

2. Используйте в компоненте:
```tsx
const data = await serversApi.newMethod()
```

### Создание нового UI компонента

1. Создайте в `src/components/ui/`:
```tsx
// src/components/ui/NewComponent.tsx
import './NewComponent.css'

export default function NewComponent() {
  return <div className="new-component">...</div>
}
```

2. Создайте стили:
```css
/* src/components/ui/NewComponent.css */
.new-component {
  /* styles */
}
```

## Полезные ссылки

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)

## Поддержка

Если возникли проблемы:
1. Проверьте README.md
2. Проверьте ARCHITECTURE.md
3. Проверьте консоль браузера
4. Проверьте логи backend

## Следующие шаги

После успешного запуска:
1. Изучите структуру проекта
2. Ознакомьтесь с компонентами
3. Попробуйте добавить сервер
4. Изучите код страниц
5. Начните разработку новых фич

---

**Готово к работе! 🎉**
