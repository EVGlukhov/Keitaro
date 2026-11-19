import unittest

from pydantic import ValidationError

from app.schemas import CampaignCreate, OfferCreate


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


if __name__ == "__main__":
    unittest.main()
