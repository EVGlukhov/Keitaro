# Keitaro Studio

MVP-обёртка над Keitaro: создание кампании с гео-потоком на Google и потоком оффера, а также добавление и удаление offer-потоков у существующей кампании.

## Запуск локально

1. Создайте `backend/.env` командой `cp backend/.env.example backend/.env` и укажите URL трекера и API key.
2. Запустите API:

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   set -a && source .env && set +a
   uvicorn app.main:app --reload
   ```

3. Запустите интерфейс в другом терминале:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Откройте `http://localhost:5173`. Swagger UI доступен по `http://localhost:8000/docs`.

Keitaro URL и API key хранятся только в окружении backend. Для реального аккаунта сверяйте формат потока и фильтра `country` с OpenAPI-документацией конкретной версии Keitaro.

## Запуск через Docker Compose

Установите Docker с поддержкой Compose. Создайте в корне `.env` с доступами к Keitaro:

```env
KEITARO_URL=https://your-tracker.example
KEITARO_API_KEY=your-api-key
```

Затем из корня проекта выполните:

```bash
docker compose up --build
```

Интерфейс будет доступен по `http://localhost:5173`, а Swagger UI — по `http://localhost:8000/docs`. SQLite-база сохраняется в volume `backend_data`.

Остановить контейнеры можно командой `docker compose down`; для удаления также базы выполните `docker compose down -v`.

## Тесты

Backend unit- и API-тесты выполняются на встроенном `unittest`; Keitaro и база данных в API-тестах заменены тестовыми реализациями:

```bash
cd backend
python -m unittest discover -s tests -v
```

Для frontend unit- и браузерных e2e-тестов установите зависимости и браузер Playwright один раз:

```bash
cd frontend
npm install
npx playwright install chromium
npm test
```

Frontend e2e-тесты перехватывают API-запросы и не требуют запущенного backend или доступа к Keitaro.
