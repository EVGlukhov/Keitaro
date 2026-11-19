import re
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CampaignCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    country_code: str = Field(min_length=2, max_length=2)
    offer_id: int = Field(gt=0)
    domain_id: int = Field(gt=0)
    group_id: int = Field(gt=0)
    traffic_source_id: int = Field(gt=0)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Название кампании не может быть пустым")
        return value

    @field_validator("country_code")
    @classmethod
    def normalize_country_code(cls, value: str) -> str:
        normalized = value.strip().upper()
        if not re.fullmatch(r"[A-Z]{2}", normalized):
            raise ValueError("Укажите двухбуквенный ISO-код страны, например US")
        return normalized


class OfferCreate(BaseModel):
    offer_id: int = Field(gt=0)


class KeitaroOption(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: int
    name: str | None = None


class StreamOfferResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    offer_id: int
    share: int | None = None
    state: str | None = None


class StreamResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: int
    name: str | None = None
    position: int | None = None
    action_type: str | None = None
    action_options: dict[str, Any] | None = None
    offers: list[StreamOfferResponse] | None = None


class CampaignResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: int
    name: str
    state: str | None = None
    streams: list[StreamResponse] = Field(default_factory=list)


class CampaignListResponse(BaseModel):
    items: list[CampaignResponse]
    total: int = Field(ge=0)
    campaign_count: int = Field(ge=0)
    limit: int = Field(ge=1)
    offset: int = Field(ge=0)


class MetadataResponse(BaseModel):
    domains: list[KeitaroOption]
    groups: list[KeitaroOption]
    traffic_sources: list[KeitaroOption]
    offers: list[KeitaroOption]


class DeleteOfferResponse(BaseModel):
    deleted: int


CampaignStatusFilter = Literal["all", "active", "inactive", "unknown"]
CampaignSortOrder = Literal["id-asc", "id-desc", "name"]
