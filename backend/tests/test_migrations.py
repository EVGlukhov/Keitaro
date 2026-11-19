import tempfile
import unittest
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

from app.models import CampaignRecord


BACKEND_ROOT = Path(__file__).resolve().parents[1]


def migration_config(database_url: str) -> Config:
    config = Config(str(BACKEND_ROOT / "alembic.ini"))
    config.set_main_option("sqlalchemy.url", database_url.replace("%", "%%"))
    return config


class MigrationTests(unittest.TestCase):
    def test_initial_migration_creates_campaign_table_and_unique_index(self):
        with tempfile.TemporaryDirectory() as directory:
            database_url = f"sqlite:///{Path(directory) / 'fresh.db'}"
            config = migration_config(database_url)

            command.upgrade(config, "head")
            command.check(config)

            engine = create_engine(database_url)
            inspector = inspect(engine)
            self.assertIn("campaign_records", inspector.get_table_names())
            self.assertTrue(
                any(
                    index["name"] == "ix_campaign_records_keitaro_id"
                    and index["unique"]
                    for index in inspector.get_indexes("campaign_records")
                )
            )
            engine.dispose()

    def test_initial_migration_adopts_existing_create_all_database(self):
        with tempfile.TemporaryDirectory() as directory:
            database_url = f"sqlite:///{Path(directory) / 'legacy.db'}"
            engine = create_engine(database_url)
            CampaignRecord.__table__.create(engine)
            engine.dispose()

            command.upgrade(migration_config(database_url), "head")

            engine = create_engine(database_url)
            inspector = inspect(engine)
            self.assertIn("campaign_records", inspector.get_table_names())
            self.assertIn("alembic_version", inspector.get_table_names())
            engine.dispose()


if __name__ == "__main__":
    unittest.main()
