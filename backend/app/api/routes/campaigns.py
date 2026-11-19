from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..dependencies import get_keitaro_client
from ...database import get_db
from ...keitaro import KeitaroClient
from ...schemas import (
    CampaignCreate,
    CampaignResponse,
    DeleteOfferResponse,
    OfferCreate,
    StreamResponse,
)
from ...services.campaign_service import CampaignService

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


@router.get("", response_model=list[CampaignResponse])
async def list_campaigns(client: KeitaroClient = Depends(get_keitaro_client)):
    return await CampaignService(client).list_campaigns()


@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    body: CampaignCreate,
    client: KeitaroClient = Depends(get_keitaro_client),
    db: Session = Depends(get_db),
):
    return await CampaignService(client).create_campaign(body, db)


@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: int,
    client: KeitaroClient = Depends(get_keitaro_client),
):
    return await CampaignService(client).get_campaign(campaign_id)


@router.post(
    "/{campaign_id}/offers",
    response_model=StreamResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_offer(
    campaign_id: int,
    body: OfferCreate,
    client: KeitaroClient = Depends(get_keitaro_client),
):
    return await CampaignService(client).add_offer(campaign_id, body)


@router.delete(
    "/{campaign_id}/offers/{stream_id}",
    response_model=DeleteOfferResponse,
)
async def delete_offer(
    campaign_id: int,
    stream_id: int,
    client: KeitaroClient = Depends(get_keitaro_client),
):
    return await CampaignService(client).delete_offer(campaign_id, stream_id)
