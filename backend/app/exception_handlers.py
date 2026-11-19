from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from .errors import (
    CampaignNotFoundError,
    InvalidCampaignOperationError,
    KeitaroConfigurationError,
)
from .keitaro import KeitaroError


async def keitaro_configuration_error(
    _: Request, exc: KeitaroConfigurationError
) -> JSONResponse:
    return JSONResponse(status_code=503, content={"detail": str(exc)})


async def keitaro_error(_: Request, exc: KeitaroError) -> JSONResponse:
    return JSONResponse(status_code=502, content={"detail": str(exc)})


async def campaign_not_found(_: Request, exc: CampaignNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


async def invalid_campaign_operation(
    _: Request, exc: InvalidCampaignOperationError
) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": str(exc)})


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(KeitaroConfigurationError, keitaro_configuration_error)
    app.add_exception_handler(KeitaroError, keitaro_error)
    app.add_exception_handler(CampaignNotFoundError, campaign_not_found)
    app.add_exception_handler(
        InvalidCampaignOperationError, invalid_campaign_operation
    )
