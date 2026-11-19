import asyncio

from ..keitaro import KeitaroClient


async def get_metadata(client: KeitaroClient) -> dict[str, list[dict]]:
    domains, groups, sources, offers = await asyncio.gather(
        client.list("domains"),
        client.list("campaign_groups"),
        client.list("traffic_sources"),
        client.list("offers"),
    )
    return {
        "domains": domains,
        "groups": groups,
        "traffic_sources": sources,
        "offers": offers,
    }
