from fastapi import APIRouter, Depends

from ..dependencies import get_keitaro_client
from ...keitaro import KeitaroClient
from ...schemas import MetadataResponse
from ...services.metadata_service import get_metadata

router = APIRouter(tags=["Metadata"])


@router.get("/metadata", response_model=MetadataResponse)
async def metadata(client: KeitaroClient = Depends(get_keitaro_client)):
    return await get_metadata(client)
