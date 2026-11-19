import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.dependencies import get_keitaro_client
from app.database import Base, get_db
from app.keitaro import KeitaroError
from app.main import app
from app.models import CampaignRecord


class FakeKeitaro:
    def __init__(self) -> None:
        self.campaigns: dict[int, dict] = {}
        self.streams: dict[int, list[dict]] = {}
        self.campaign_list: list[dict] = []
        self.next_campaign_id = 41
        self.next_stream_id = 100
        self.fail_campaign_list = False

    async def list(self, path: str):
        if path == "campaigns" and self.fail_campaign_list:
            raise KeitaroError("Keitaro is unavailable")
        if path == "campaigns":
            return self.campaign_list
        return []

    async def create_campaign(self, payload):
        campaign = {"id": self.next_campaign_id, **payload}
        self.campaigns[self.next_campaign_id] = campaign
        self.streams[self.next_campaign_id] = []
        return campaign

    async def create_stream(self, payload):
        stream = {"id": self.next_stream_id, **payload}
        self.next_stream_id += 1
        self.streams[payload["campaign_id"]].append(stream)
        return stream

    async def get_campaign(self, campaign_id: int):
        return self.campaigns[campaign_id]

    async def campaign_streams(self, campaign_id: int):
        return self.streams.get(campaign_id, [])

    async def request(self, method: str, path: str):
        stream_id = int(path.split("/")[-1])
        for campaign_streams in self.streams.values():
            campaign_streams[:] = [
                stream for stream in campaign_streams if stream["id"] != stream_id
            ]
        return None

    async def delete_campaign(self, campaign_id: int):
        self.campaigns.pop(campaign_id, None)
        self.streams.pop(campaign_id, None)


class CampaignApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(bind=self.engine)
        self.session_factory = sessionmaker(bind=self.engine, autoflush=False)
        self.keitaro = FakeKeitaro()

        def override_get_db():
            with self.session_factory() as db:
                yield db

        app.dependency_overrides[get_keitaro_client] = lambda: self.keitaro
        app.dependency_overrides[get_db] = override_get_db
        self.client = TestClient(app)

    def tearDown(self) -> None:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=self.engine)
        self.engine.dispose()

    def test_health_endpoint_is_available_under_api_prefix(self):
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_create_add_and_delete_offer_workflow(self):
        response = self.client.post(
            "/api/campaigns",
            json={
                "name": "  Spring campaign ",
                "country_code": "us",
                "offer_id": 8,
                "domain_id": 2,
                "group_id": 3,
                "traffic_source_id": 4,
            },
        )

        self.assertEqual(response.status_code, 201)
        campaign = response.json()
        self.assertEqual(campaign["name"], "Spring campaign")
        self.assertEqual(campaign["streams"][0]["filters"][0]["payload"], ["US"])
        self.assertEqual(campaign["streams"][1]["action_options"]["offer_id"], 8)

        added = self.client.post(
            "/api/campaigns/41/offers",
            json={"offer_id": 9},
        )
        self.assertEqual(added.status_code, 201)
        self.assertEqual(added.json()["position"], 3)

        details = self.client.get("/api/campaigns/41")
        self.assertEqual(len(details.json()["streams"]), 3)
        deleted = self.client.delete(
            f"/api/campaigns/41/offers/{added.json()['id']}"
        )
        self.assertEqual(deleted.status_code, 200)
        self.assertEqual(deleted.json(), {"deleted": added.json()["id"]})
        self.assertEqual(len(self.client.get("/api/campaigns/41").json()["streams"]), 2)

        with self.session_factory() as db:
            saved = db.query(CampaignRecord).filter_by(keitaro_id=41).one()
            self.assertEqual(saved.name, "Spring campaign")

    def test_invalid_country_is_rejected_by_api(self):
        response = self.client.post(
            "/api/campaigns",
            json={
                "name": "Invalid country",
                "country_code": "USA",
                "offer_id": 8,
                "domain_id": 2,
                "group_id": 3,
                "traffic_source_id": 4,
            },
        )

        self.assertEqual(response.status_code, 422)

    def test_openapi_documents_campaign_api_response_models(self):
        schema = self.client.get("/openapi.json").json()
        paths = schema["paths"]

        self.assertEqual(
            paths["/api/campaigns"]["get"]["responses"]["200"]["content"][
                "application/json"
            ]["schema"]["$ref"],
            "#/components/schemas/CampaignListResponse",
        )
        self.assertEqual(
            paths["/api/campaigns/{campaign_id}/offers"]["post"]["responses"][
                "201"
            ]["content"]["application/json"]["schema"]["$ref"],
            "#/components/schemas/StreamResponse",
        )

    def test_campaign_list_search_sort_and_pagination(self):
        self.keitaro.campaign_list = [
            {"id": 5, "name": "Alpha Zeta", "state": "active"},
            {"id": 2, "name": "Alpha Alpha", "state": "ACTIVE"},
            {"id": 3, "name": "Beta", "state": "active"},
            {"id": 4, "name": "Alpha paused", "state": "disabled"},
            {"id": 6, "name": "No state"},
        ]

        first_page = self.client.get(
            "/api/campaigns",
            params={
                "q": " alpha ",
                "status": "active",
                "sort": "name",
                "limit": 1,
                "offset": 0,
            },
        )
        second_page = self.client.get(
            "/api/campaigns",
            params={
                "q": "alpha",
                "status": "active",
                "sort": "name",
                "limit": 1,
                "offset": 1,
            },
        )
        inactive = self.client.get(
            "/api/campaigns",
            params={"q": "alpha", "status": "inactive"},
        )
        unknown = self.client.get(
            "/api/campaigns",
            params={"status": "unknown", "sort": "id-desc"},
        )
        by_id = self.client.get("/api/campaigns", params={"q": "4"})

        self.assertEqual(first_page.status_code, 200)
        self.assertEqual(
            first_page.json(),
            {
                "items": [
                    {
                        "id": 2,
                        "name": "Alpha Alpha",
                        "state": "ACTIVE",
                        "streams": [],
                    }
                ],
                "total": 2,
                "campaign_count": 5,
                "limit": 1,
                "offset": 0,
            },
        )
        self.assertEqual(second_page.json()["items"][0]["id"], 5)
        self.assertEqual([item["id"] for item in inactive.json()["items"]], [4])
        self.assertEqual([item["id"] for item in unknown.json()["items"]], [6])
        self.assertEqual([item["id"] for item in by_id.json()["items"]], [4])

    def test_geo_stream_cannot_be_deleted(self):
        campaign = self.client.post(
            "/api/campaigns",
            json={
                "name": "Protected geo",
                "country_code": "US",
                "offer_id": 8,
                "domain_id": 2,
                "group_id": 3,
                "traffic_source_id": 4,
            },
        ).json()

        response = self.client.delete(
            f"/api/campaigns/{campaign['id']}/offers/{campaign['streams'][0]['id']}"
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(len(self.keitaro.streams[41]), 2)

    def test_unknown_stream_returns_not_found(self):
        response = self.client.delete("/api/campaigns/41/offers/999")

        self.assertEqual(response.status_code, 404)

    def test_keitaro_failure_is_reported_as_bad_gateway(self):
        self.keitaro.fail_campaign_list = True

        response = self.client.get("/api/campaigns")

        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.json()["detail"], "Keitaro is unavailable")

    def test_missing_keitaro_configuration_is_reported_as_unavailable(self):
        keitaro_override = app.dependency_overrides.pop(get_keitaro_client)
        try:
            with patch.dict(
                "os.environ", {"KEITARO_URL": "", "KEITARO_API_KEY": ""}
            ):
                response = self.client.get("/api/campaigns")
        finally:
            app.dependency_overrides[get_keitaro_client] = keitaro_override

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["detail"], "Не задан KEITARO_URL")


if __name__ == "__main__":
    unittest.main()
