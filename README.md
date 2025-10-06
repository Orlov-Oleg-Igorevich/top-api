<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="96" alt="NestJS" />
</p>

<h2 align="center">Top API — сервер на NestJS, MongoDB и JWT</h2>

<p align="center">
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-11-red?logo=nestjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white" />
  <img alt="Node" src="https://img.shields.io/badge/Node-%3E%3D20-3c873a?logo=node.js&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-6%2B-47A248?logo=mongodb&logoColor=white" />
  <img alt="Tests" src="https://img.shields.io/badge/tests-e2e%20%26%20unit-brightgreen?logo=jest&logoColor=white" />
  <img alt="Lint" src="https://img.shields.io/badge/code%20style-eslint%20%2B%20prettier-4B32C3?logo=eslint&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/license-UNLICENSED-lightgrey" />
</p>

Надёжный REST API для работы с сущностями: аутентификация, товары, отзывы и топ‑страницы. Построен на NestJS 11, хранение данных в MongoDB (Mongoose), авторизация по JWT. В проекте есть e2e‑тесты, линтинг и форматирование кода.

---

### Содержание
- [Возможности](#возможности)
- [Стек](#стек)
- [Структура проекта](#структура-проекта)
- [Быстрый старт](#быстрый-старт)
- [Переменные окружения](#переменные-окружения)
- [Скрипты](#скрипты)
- [Запуск MongoDB через Docker](#запуск-mongodb-через-docker)
- [API](#api)
  - [Базовый URL](#базовый-url)
  - [Аутентификация](#аутентификация)
  - [Товары](#товары)
  - [Отзывы](#отзывы)
  - [Топ‑страницы](#топстраницы)
- [Тестирование](#тестирование)
- [Код‑стайл](#кодстайл)
- [Лицензия](#лицензия)

---

### Возможности
- **JWT-аутентификация**: регистрация и вход, защита приватных эндпоинтов.
- **Валидация DTO**: строгая валидация запросов (`class-validator`/`class-transformer`).
- **MongoDB/Mongoose**: схемы и модели для основных доменов.
- **Группировка и поиск**: примеры агрегаций и полнотекстового поиска.
- **Глобальные пайпы**: sane defaults (whitelist, transform, BAD_REQUEST при ошибках).
- **Тесты**: набор e2e‑тестов для ключевых сценариев.

### Стек
- **Runtime**: Node.js 20+
- **Framework**: NestJS 11 (`@nestjs/*`)
- **БД**: MongoDB 6+ (Docker Compose), ODM: Mongoose 8
- **Auth**: `@nestjs/jwt`, `passport-jwt`
- **Язык**: TypeScript 5, TSConfig (module: `nodenext`, target: ES2023)
- **Тесты**: Jest, SuperTest
- **Качество кода**: ESLint 9, Prettier 3

### Структура проекта
```text
src/
  app.module.ts               # Корневой модуль
  main.ts                     # Точка входа (глобальный префикс /api)
  auth/                       # Регистрация/логин, JWT стратегия и Guard
  product/                    # CRUD для товаров + поиск
  review/                     # CRUD отзывов + выборка по продукту
  top-page/                   # CRUD + поиск/агрегации по категориям
  config/                     # Конфиг Mongo и JWT
  pipes/, decorators/, utils/ # Общие утилиты и пайпы

test/                         # e2e-тесты для доменов
```

### Быстрый старт
1. Установите зависимости:
   ```bash
   npm install
   ```
2. Создайте файл `.env` на основе примера и задайте значения (см. ниже):
   ```bash
   cp .env.example .env
   ```
3. Поднимите MongoDB (удобно через Docker Compose):
   ```bash
   docker compose up -d
   ```
4. Запустите сервер разработки:
   ```bash
   npm run start:dev
   ```
5. API будет доступен по адресу `http://localhost:3000/api`.

### Переменные окружения
Файл `.env` (см. `.env.example`):
- `MONGO_LOGIN` — логин MongoDB
- `MONGO_PASSWORD` — пароль MongoDB
- `MONGO_HOST` — хост MongoDB (например, `localhost`)
- `MONGO_PORT` — порт MongoDB (например, `27018` при использовании compose)
- `MONGO_DATABASE` — имя БД (например, `top-api`)
- `MONGO_AUTH_DATABASE` — база аутентификации (для root обычно `admin`)
- `JWT_SECRET` — секрет для выпуска JWT

Примечания:
- Приложение формирует строку подключения вида `mongodb://{login}:{password}@{host}:{port}/{database}` и передаёт `authSource` из `MONGO_AUTH_DATABASE`.
- Если используете root‑пользователя из Docker, задайте `MONGO_AUTH_DATABASE=admin`.

### Скрипты
```bash
# Запуск
npm run start           # dev без watch (Nest CLI)
npm run start:dev       # dev с watch
npm run start:prod      # прод (предварительно собрать)

# Сборка
npm run build           # nest build

# Тесты
npm run test            # unit
npm run test:e2e        # e2e (`test/jest-e2e.json`)
npm run test:cov        # coverage

# Качество кода
npm run lint            # eslint --fix
npm run format          # prettier --write
```

### Запуск MongoDB через Docker
Docker Compose уже настроен в `docker-compose.yml`.

1) Заполните переменные для root‑пользователя (можно в `.env`):
```bash
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=admin
```

2) Поднимите контейнер MongoDB:
```bash
docker compose up -d
```
Mongo будет доступен на `localhost:27018`.

3) Подключение приложения:
```bash
# .env
MONGO_LOGIN=admin
MONGO_PASSWORD=admin
MONGO_HOST=localhost
MONGO_PORT=27018
MONGO_DATABASE=top-api
MONGO_AUTH_DATABASE=admin
JWT_SECRET=very_secret_key
```

### API

#### Базовый URL
- По умолчанию сервер в dev режиме использует префикс: **`/api`** (см. `src/main.ts`).
- Примеры ниже указаны с учётом этого префикса.

> В e2e‑тестах префикс не устанавливается (тестовое приложение поднимается без `main.ts`).

#### Аутентификация
- `POST /api/auth/register` — регистрация пользователя
  ```json
  {
    "email": "user@example.com",
    "password": "string"
  }
  ```
- `POST /api/auth/login` — вход, возвращает JWT:
  ```json
  { "accessToken": "<jwt>" }
  ```

Используйте заголовок: `Authorization: Bearer <jwt>` для приватных эндпоинтов.

#### Товары
Требуется JWT для всех операций, кроме поиска.
- `POST /api/product/create` — создать товар
- `GET /api/product/:id` — получить товар
- `PATCH /api/product/:id` — обновить товар
- `DELETE /api/product/:id` — удалить товар
- `POST /api/product/find` — поиск по категории (публичный)

Пример DTO для создания товара:
```json
{
  "image": "image.jpg",
  "title": "Test Product",
  "price": 999,
  "oldPrice": 1299,
  "credit": 83,
  "categories": ["electronics", "smartphones"],
  "description": "Description",
  "advantages": "Pros",
  "disAdvantages": "Cons",
  "characteristics": [{ "name": "Color", "value": "Black" }],
  "tags": ["new"]
}
```

#### Отзывы
Все эндпоинты требуют JWT.
- `POST /api/review/create` — создать отзыв
- `GET /api/review/:id` — получить отзыв
- `DELETE /api/review/:id` — удалить отзыв
- `GET /api/review/byProduct/:productId` — отзывы по товару

#### Топ‑страницы
CRUD требует JWT; поиск — публичный.
- `POST /api/top-page/create` — создать
- `GET /api/top-page/:id` — получить
- `PATCH /api/top-page/:id` — обновить
- `DELETE /api/top-page/:id` — удалить
- `POST /api/top-page/find` — группировка по категориям (публичный)
- `GET /api/top-page/findByText/:text` — полнотекстовый поиск (публичный)

#### Пример: получение токена и запрос с авторизацией
```bash
# login → получить токен
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"pass"}' | jq -r .accessToken)

# создать продукт
curl -X POST http://localhost:3000/api/product/create \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"image":"a.jpg","title":"A","price":1,"credit":0,"categories":["c"],"description":"d","advantages":"+","disAdvantages":"-","characteristics":[],"tags":[]}'
```

### Тестирование
- Запуск unit‑тестов: `npm run test`
- Запуск e2e‑тестов: `npm run test:e2e`

Требования для e2e:
- Запущенная MongoDB и корректный `.env`.
- В тестах создаётся приложение без глобального префикса `/api`.

### Код‑стайл
- ESLint: `npm run lint` (с автоисправлениями)
- Prettier: `npm run format`
- TSConfig: строгий режим включён (`strict: true`), декораторы активированы.

### Лицензия
`UNLICENSED` — проект не предназначен для публичного распространения.
