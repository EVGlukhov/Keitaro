import unittest

from pydantic import ValidationError

from app.schemas import (
    CampaignCreate,
    CampaignResponse,
    DeleteOfferResponse,
    KeitaroOption,
    OfferCreate,
)


class CampaignSchemaTests(unittest.TestCase):
    def test_campaign_name_and_country_are_normalized(self):
        campaign = CampaignCreate(
            name="  Test campaign  ",
            country_code="us",
            offer_id=8,
            domain_id=2,
            group_id=3,
            traffic_source_id=4,
        )

        self.assertEqual(campaign.name, "Test campaign")
        self.assertEqual(campaign.country_code, "US")

    def test_invalid_country_code_is_rejected(self):
        with self.assertRaises(ValidationError):
            CampaignCreate(
                name="Test campaign",
                country_code="USA",
                offer_id=8,
                domain_id=2,
                group_id=3,
                traffic_source_id=4,
            )

    def test_offer_id_must_be_positive(self):
        with self.assertRaises(ValidationError):
            OfferCreate(offer_id=0)

    def test_keitaro_response_models_preserve_extra_fields(self):
        option = KeitaroOption.model_validate(
            {"id": 8, "name": "Offer", "state": "active"}
        )
        campaign = CampaignResponse.model_validate(
            {
                "id": 41,
                "name": "Campaign",
                "streams": [
                    {
                        "id": 100,
                        "action_type": "offer",
                        "action_options": {"offer_id": 8},
                        "filters": [],
                    }
                ],
            }
        )

        self.assertEqual(option.model_dump()["state"], "active")
        self.assertEqual(campaign.streams[0].model_dump()["filters"], [])
        self.assertEqual(DeleteOfferResponse(deleted=100).deleted, 100)


if __name__ == "__main__":
    unittest.main()
