import logging
from typing import Any

from sqlalchemy.orm import Session

from ..errors import CampaignNotFoundError, InvalidCampaignOperationError
from ..keitaro import KeitaroClient, KeitaroError
from ..models import CampaignRecord
from ..schemas import CampaignCreate, OfferCreate

logger = logging.getLogger(__name__)


class CampaignService:
    def __init__(self, client: KeitaroClient) -> None:
        self.client = client

    async def list_campaigns(self) -> list[dict[str, Any]]:
        return await self.client.list("campaigns")

    async def create_campaign(
        self, data: CampaignCreate, db: Session
    ) -> dict[str, Any]:
        campaign = await self.client.create_campaign(
            {
                "name": data.name,
                "domain_id": data.domain_id,
                "group_id": data.group_id,
                "traffic_source_id": data.traffic_source_id,
                "state": "active",
                "type": "classic",
            }
        )
        campaign_id = self._campaign_id(campaign)

        try:
            geo_stream = await self.client.create_stream(
                self._stream_payload(
                    campaign_id=campaign_id,
                    name=f"Гео {data.country_code} → Google",
                    action_type="http",
                    action_options={"url": "https://www.google.com"},
                    position=1,
                    filters=[
                        {
                            "name": "country",
                            "mode": "accept",
                            "payload": [data.country_code],
                        }
                    ],
                )
            )
            offer_stream = await self.client.create_stream(
                self._stream_payload(
                    campaign_id=campaign_id,
                    name=f"Оффер {data.offer_id}",
                    action_type="offer",
                    action_options={"offer_id": data.offer_id},
                    position=2,
                    stream_type="default",
                )
            )
        except KeitaroError:
            await self._cleanup_partial_campaign(campaign_id)
            raise

        db.merge(CampaignRecord(keitaro_id=campaign_id, name=data.name))
        db.commit()

        return {
            "id": campaign_id,
            "name": data.name,
            "state": "active",
            "streams": [geo_stream, offer_stream],
        }

    async def get_campaign(self, campaign_id: int) -> dict[str, Any]:
        campaign = await self.client.get_campaign(campaign_id)
        streams = await self.client.campaign_streams(campaign_id)
        return {
            "id": self._campaign_id(campaign),
            "name": campaign.get("name", f"Кампания {campaign_id}"),
            "state": campaign.get("state"),
            "streams": streams,
        }

    async def add_offer(self, campaign_id: int, data: OfferCreate) -> dict[str, Any]:
        streams = await self.client.campaign_streams(campaign_id)
        next_position = max(
            (stream.get("position", 0) for stream in streams),
            default=0,
        ) + 1
        return await self.client.create_stream(
            self._stream_payload(
                campaign_id=campaign_id,
                name=f"Оффер {data.offer_id}",
                action_type="offer",
                action_options={"offer_id": data.offer_id},
                position=next_position,
            )
        )

    async def delete_offer(self, campaign_id: int, stream_id: int) -> dict[str, int]:
        streams = await self.client.campaign_streams(campaign_id)
        stream = next(
            (
                item
                for item in streams
                if item.get("id") == stream_id
                and item.get("campaign_id") == campaign_id
            ),
            None,
        )
        if stream is None:
            raise CampaignNotFoundError("Поток не найден в кампании")
        if stream.get("action_type") != "offer":
            raise InvalidCampaignOperationError(
                "Удалять можно только поток оффера"
            )
        await self.client.request("DELETE", f"streams/{stream_id}")
        return {"deleted": stream_id}

    @staticmethod
    def _campaign_id(campaign: dict[str, Any]) -> int:
        campaign_id = campaign.get("id")
        if not isinstance(campaign_id, int):
            raise KeitaroError("Keitaro не вернул ID кампании")
        return campaign_id

    @staticmethod
    def _stream_payload(
        campaign_id: int,
        name: str,
        action_type: str,
        action_options: dict[str, Any],
        position: int,
        filters: list[dict[str, Any]] | None = None,
        stream_type: str = "regular",
    ) -> dict[str, Any]:
        return {
            "campaign_id": campaign_id,
            "name": name,
            "type": stream_type,
            "position": position,
            "action_type": action_type,
            "action_options": action_options,
            "filters": filters or [],
        }

    async def _cleanup_partial_campaign(self, campaign_id: int) -> None:
        try:
            await self.client.delete_campaign(campaign_id)
        except KeitaroError:
            logger.exception(
                "Failed to clean up partially created campaign %s",
                campaign_id,
            )
