from fastapi import HTTPException, Request

from ..config import get_settings
from ..errors import KeitaroConfigurationError
from ..keitaro import KeitaroClient, KeitaroError


def get_keitaro_client(request: Request) -> KeitaroClient:
    settings = get_settings()
    if not settings.keitaro_url:
        raise KeitaroConfigurationError("Не задан KEITARO_URL")
    if not settings.keitaro_api_key:
        raise KeitaroConfigurationError("Не задан KEITARO_API_KEY")
    try:
        return KeitaroClient(
            settings.keitaro_url,
            settings.keitaro_api_key,
            http_client=request.app.state.keitaro_http_client,
        )
    except KeitaroError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
