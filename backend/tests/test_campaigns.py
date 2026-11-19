import unittest
from unittest.mock import Mock

from app.errors import InvalidCampaignOperationError
from app.keitaro import KeitaroError
from app.schemas import CampaignCreate, OfferCreate
from app.services.campaign_service import CampaignService


class FakeKeitaro:
    def __init__(self) -> None:
        self.streams: list[dict] = []
        self.deleted_campaigns: list[int] = []
        self.deleted_streams: list[int] = []
        self.fail_on_stream = False

    async def create_campaign(self, payload):
        self.campaign_payload = payload
        return {"id": 41}

    async def create_stream(self, payload):
        if self.fail_on_stream and self.streams:
            raise KeitaroError("stream creation failed")
        stream = {"id": 100 + len(self.streams), **payload}
        self.streams.append(stream)
        return stream

    async def delete_campaign(self, campaign_id):
        self.deleted_campaigns.append(campaign_id)

    async def campaign_streams(self, campaign_id):
        return [stream for stream in self.streams if stream["campaign_id"] == campaign_id]

    async def request(self, method, path):
        self.deleted_streams.append(int(path.split("/")[-1]))


class CampaignTests(unittest.IsolatedAsyncioTestCase):
    async def test_creation_adds_geo_and_offer_streams(self):
        client = FakeKeitaro()
        db = Mock()
        body = CampaignCreate(
            name="  Test campaign ",
            country_code="us",
            offer_id=8,
            domain_id=2,
            group_id=3,
            traffic_source_id=4,
        )

        result = await CampaignService(client).create_campaign(body, db)

        self.assertEqual(result["id"], 41)
        self.assertEqual(len(client.streams), 2)
        self.assertEqual(client.streams[0]["filters"][0]["payload"], ["US"])
        self.assertEqual(client.streams[0]["type"], "regular")
        self.assertEqual(client.streams[0]["action_options"]["url"], "https://www.google.com")
        self.assertEqual(client.streams[1]["action_options"]["offer_id"], 8)
        self.assertEqual(client.streams[1]["type"], "default")
        self.assertEqual(client.campaign_payload["domain_id"], 2)
        db.commit.assert_called_once()

    async def test_failed_stream_creation_removes_partial_campaign(self):
        client = FakeKeitaro()
        client.fail_on_stream = True
        db = Mock()
        body = CampaignCreate(
            name="Test",
            country_code="US",
            offer_id=8,
            domain_id=2,
            group_id=3,
            traffic_source_id=4,
        )

        with self.assertRaises(KeitaroError):
            await CampaignService(client).create_campaign(body, db)

        self.assertEqual(client.deleted_campaigns, [41])
        db.commit.assert_not_called()

    async def test_add_offer_positions_after_existing_streams(self):
        client = FakeKeitaro()
        client.streams = [
            {"id": 1, "campaign_id": 41, "position": 3, "action_type": "offer"}
        ]

        result = await CampaignService(client).add_offer(41, OfferCreate(offer_id=9))

        self.assertEqual(result["position"], 4)
        self.assertEqual(result["action_options"]["offer_id"], 9)

    async def test_delete_rejects_non_offer_stream(self):
        client = FakeKeitaro()
        client.streams = [
            {"id": 1, "campaign_id": 41, "action_type": "http"}
        ]

        with self.assertRaises(InvalidCampaignOperationError):
            await CampaignService(client).delete_offer(41, 1)

        self.assertEqual(client.deleted_streams, [])

    async def test_delete_offer_removes_only_matching_stream(self):
        client = FakeKeitaro()
        client.streams = [
            {"id": 1, "campaign_id": 41, "action_type": "offer"},
            {"id": 2, "campaign_id": 41, "action_type": "http"},
        ]

        result = await CampaignService(client).delete_offer(41, 1)

        self.assertEqual(result, {"deleted": 1})
        self.assertEqual(client.deleted_streams, [1])


if __name__ == "__main__":
    unittest.main()
