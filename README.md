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

Backend применяет Alembic-миграции при старте. Первая миграция создаёт таблицу для новой базы или распознаёт таблицу, созданную прежней версией приложения; начальную миграцию нельзя откатить, так как она может принять существующую базу.

## Запуск через Docker Compose

Установите Docker с поддержкой Compose. Скопируйте пример и укажите в корневом `.env` доступы к Keitaro:

```bash
cp .env.example .env
```

```env
KEITARO_URL=https://your-tracker.example
KEITARO_API_KEY=your-api-key
```

Запустите оба сервиса из корня проекта:

```bash
docker compose up --build
```

Интерфейс будет доступен по `http://localhost:5173`, а Swagger UI — по `http://localhost:8000/docs`. Порты привязаны к localhost и недоступны напрямую из сети. Для развёртывания за reverse proxy настройте его на эти локальные порты. SQLite-база сохраняется в volume `backend_data`.

Остановить контейнеры можно командой `docker compose down`; для удаления также базы выполните `docker compose down -v`.

### Резервное копирование и восстановление SQLite

Пока Compose запущен, создайте согласованную копию базы SQLite:

```bash
sh scripts/backup-db.sh
```

Файл сохранится вне репозитория в `$XDG_DATA_HOME/keitaro-wrapper/backups` или, если `XDG_DATA_HOME` не задан, в `$HOME/.local/share/keitaro-wrapper/backups`.

Для восстановления сначала остановите backend, затем скопируйте выбранную резервную копию в volume и запустите backend снова:

```bash
docker compose stop backend
docker compose cp "$HOME/.local/share/keitaro-wrapper/backups/keitaro-wrapper-<timestamp>.db" backend:/data/keitaro_wrapper.db
docker compose start backend
```

Перед восстановлением сохраните текущую базу отдельной копией. Если резервная копия находится в другом каталоге, укажите её фактический путь.

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
