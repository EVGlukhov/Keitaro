import re
from typing import Any

from pydantic import BaseModel, Field, field_validator


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


class CampaignResponse(BaseModel):
    id: int
    name: str
    state: str | None = None
    streams: list[dict[str, Any]] = Field(default_factory=list)


class MetadataResponse(BaseModel):
    domains: list[dict[str, Any]]
    groups: list[dict[str, Any]]
    traffic_sources: list[dict[str, Any]]
    offers: list[dict[str, Any]]
