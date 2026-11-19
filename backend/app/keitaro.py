import logging
from typing import Any
from urllib.parse import urljoin

import httpx


logger = logging.getLogger(__name__)


class KeitaroError(Exception):
    pass


class KeitaroClient:
    def __init__(
        self,
        base_url: str,
        api_key: str,
        http_client: httpx.AsyncClient | None = None,
    ) -> None:
        base_url = base_url.strip().rstrip("/")
        if not base_url:
            raise KeitaroError("Не задан KEITARO_URL")
        if base_url.endswith("/admin_api/v1"):
            self.api_url = base_url + "/"
        else:
            self.api_url = base_url + "/admin_api/v1/"
        self.api_key = api_key.strip()
        self.http_client = http_client
        if not self.api_key:
            raise KeitaroError("Не задан KEITARO_API_KEY")

    async def request(
        self, method: str, path: str, **kwargs: Any
    ) -> Any:
        url = urljoin(self.api_url, path.lstrip("/"))
        headers = {"Api-Key": self.api_key, **kwargs.pop("headers", {})}
        try:
            if self.http_client is None:
                async with httpx.AsyncClient(timeout=20) as client:
                    response = await client.request(
                        method, url, headers=headers, **kwargs
                    )
            else:
                response = await self.http_client.request(
                    method, url, headers=headers, **kwargs
                )
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.warning(
                "Keitaro request %s %s failed with HTTP %s",
                method,
                path,
                exc.response.status_code,
            )
            raise KeitaroError(f"Keitaro ответил HTTP {exc.response.status_code}") from exc
        except httpx.RequestError as exc:
            logger.warning(
                "Keitaro request %s %s failed (%s)",
                method,
                path,
                type(exc).__name__,
            )
            raise KeitaroError(
                f"Не удалось связаться с Keitaro ({type(exc).__name__})"
            ) from exc

        if response.status_code == 204 or not response.content:
            return None
        try:
            return response.json()
        except ValueError as exc:
            raise KeitaroError("Keitaro вернул ответ в неизвестном формате") from exc

    async def list(self, path: str) -> list[dict[str, Any]]:
        result = await self.request("GET", path)
        if isinstance(result, list):
            return result
        if isinstance(result, dict):
            for key in ("data", "items", "results"):
                if isinstance(result.get(key), list):
                    return result[key]
        raise KeitaroError(f"Keitaro вернул неожиданный список для {path}")

    async def get_campaign(self, campaign_id: int) -> dict[str, Any]:
        result = await self.request("GET", f"campaigns/{campaign_id}")
        if not isinstance(result, dict):
            raise KeitaroError("Keitaro вернул кампанию в неизвестном формате")
        return result

    async def campaign_streams(self, campaign_id: int) -> list[dict[str, Any]]:
        result = await self.request(
            "GET", "streams", params={"campaign_id": campaign_id}
        )
        if isinstance(result, list):
            return result
        if isinstance(result, dict):
            for key in ("data", "items", "results"):
                if isinstance(result.get(key), list):
                    return result[key]
        raise KeitaroError("Keitaro вернул потоки в неизвестном формате")

    async def create_campaign(self, payload: dict[str, Any]) -> dict[str, Any]:
        result = await self.request("POST", "campaigns", json=payload)
        if not isinstance(result, dict):
            raise KeitaroError("Keitaro вернул кампанию в неизвестном формате")
        return result

    async def create_stream(self, payload: dict[str, Any]) -> dict[str, Any]:
        result = await self.request("POST", "streams", json=payload)
        if not isinstance(result, dict):
            raise KeitaroError("Keitaro вернул поток в неизвестном формате")
        return result

    async def delete_campaign(self, campaign_id: int) -> None:
        await self.request("DELETE", f"campaigns/{campaign_id}")
