import logging
import re
import secrets
from typing import Any

from sqlalchemy.orm import Session

from ..errors import CampaignNotFoundError, InvalidCampaignOperationError
from ..keitaro import KeitaroClient, KeitaroError
from ..models import CampaignRecord
from ..schemas import (
    CampaignCreate,
    CampaignSortOrder,
    CampaignStatusFilter,
    OfferCreate,
)

logger = logging.getLogger(__name__)


class CampaignService:
    def __init__(self, client: KeitaroClient) -> None:
        self.client = client

    async def list_campaigns(
        self,
        query: str | None,
        status_filter: CampaignStatusFilter,
        sort: CampaignSortOrder,
        offset: int,
        limit: int,
    ) -> dict[str, Any]:
        campaigns = await self.client.list("campaigns")
        filtered = [
            campaign
            for campaign in campaigns
            if self._matches_query(campaign, query)
            and self._matches_status(campaign, status_filter)
        ]
        if sort == "name":
            filtered.sort(
                key=lambda campaign: (
                    str(campaign.get("name", "")).casefold(),
                    self._campaign_sort_id(campaign),
                )
            )
        else:
            filtered.sort(key=self._campaign_sort_id)
            if sort == "id-desc":
                filtered.reverse()

        return {
            "items": filtered[offset : offset + limit],
            "total": len(filtered),
            "campaign_count": len(campaigns),
            "limit": limit,
            "offset": offset,
        }

    @staticmethod
    def _matches_query(campaign: dict[str, Any], query: str | None) -> bool:
        normalized_query = (query or "").strip().casefold()
        if not normalized_query:
            return True
        return (
            normalized_query in str(campaign.get("name", "")).casefold()
            or normalized_query in str(campaign.get("id", ""))
        )

    @staticmethod
    def _matches_status(
        campaign: dict[str, Any], status_filter: CampaignStatusFilter
    ) -> bool:
        state = campaign.get("state")
        active = isinstance(state, str) and state.casefold() == "active"
        if status_filter == "all":
            return True
        if status_filter == "active":
            return active
        if status_filter == "inactive":
            return bool(state) and not active
        return not state

    @staticmethod
    def _campaign_sort_id(campaign: dict[str, Any]) -> int:
        value = campaign.get("id")
        return value if isinstance(value, int) else 0

    async def create_campaign(
        self, data: CampaignCreate, db: Session
    ) -> dict[str, Any]:
        campaign = await self.client.create_campaign(
            {
                "name": data.name,
                "alias": self._campaign_alias(data.name),
                "domain_id": data.domain_id,
                "group_id": str(data.group_id),
                "traffic_source_id": data.traffic_source_id,
                "state": "active",
                "type": "position",
            }
        )
        campaign_id = self._campaign_id(campaign)

        try:
            geo_stream = await self.client.create_stream(
                self._stream_payload(
                    campaign_id=campaign_id,
                    name=f"Гео {data.country_code} → Google",
                    action_type="http",
                    schema="redirect",
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
                    schema="landings",
                    action_type="http",
                    offers=[
                        {
                            "offer_id": data.offer_id,
                            "share": 100,
                            "state": "active",
                        }
                    ],
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
                schema="landings",
                action_type="http",
                offers=[
                    {
                        "offer_id": data.offer_id,
                        "share": 100,
                        "state": "active",
                    }
                ],
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
        offers = stream.get("offers")
        if stream.get("action_type") != "offer" and not (
            isinstance(offers, list) and offers
        ):
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
    def _campaign_alias(name: str) -> str:
        slug = re.sub(r"[^a-z0-9]+", "-", name.casefold()).strip("-")
        return f"{slug[:48] or 'campaign'}-{secrets.token_hex(4)}"

    @staticmethod
    def _stream_payload(
        campaign_id: int,
        name: str,
        schema: str,
        action_type: str,
        position: int,
        action_options: dict[str, Any] | None = None,
        filters: list[dict[str, Any]] | None = None,
        offers: list[dict[str, Any]] | None = None,
        stream_type: str = "regular",
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "campaign_id": campaign_id,
            "schema": schema,
            "name": name,
            "type": stream_type,
            "position": position,
            "action_type": action_type,
            "filters": filters or [],
        }
        if action_options is not None:
            payload["action_options"] = action_options
        if offers is not None:
            payload["offers"] = offers
        return payload

    async def _cleanup_partial_campaign(self, campaign_id: int) -> None:
        try:
            await self.client.delete_campaign(campaign_id)
        except KeitaroError:
            logger.exception(
                "Failed to clean up partially created campaign %s",
                campaign_id,
            )
