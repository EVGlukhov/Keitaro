# Keitaro Wrapper API

## Запуск

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Заполните KEITARO_URL и KEITARO_API_KEY
set -a && source .env && set +a
uvicorn app.main:app --reload
```

Swagger UI: `http://localhost:8000/docs`.

Ключ API используется только сервером. Не передавайте его в React-клиент.

## Структура

- `app/api/routes` — HTTP-маршруты.
- `app/services` — работа с кампаниями и метаданными.
- `app/keitaro.py` — клиент Keitaro Admin API.
- `app/schemas.py`, `app/models.py` — API-схемы и SQLAlchemy-модели.
