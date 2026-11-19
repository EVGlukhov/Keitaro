from alembic import op
import sqlalchemy as sa


revision = "0001_campaign_records"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    if "campaign_records" in inspector.get_table_names():
        existing_columns = {
            column["name"] for column in inspector.get_columns("campaign_records")
        }
        expected_columns = {
            "id",
            "keitaro_id",
            "name",
            "created_at",
            "updated_at",
        }
        if not expected_columns.issubset(existing_columns):
            raise RuntimeError(
                "Existing campaign_records table does not match the expected schema"
            )
        has_unique_keitaro_id = any(
            index["unique"] and index["column_names"] == ["keitaro_id"]
            for index in inspector.get_indexes("campaign_records")
        )
        if not has_unique_keitaro_id:
            raise RuntimeError(
                "Existing campaign_records table is missing its unique Keitaro ID index"
            )
        return

    op.create_table(
        "campaign_records",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("keitaro_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_campaign_records_keitaro_id",
        "campaign_records",
        ["keitaro_id"],
        unique=True,
    )


def downgrade() -> None:
    raise RuntimeError(
        "The initial migration cannot be downgraded safely because it may adopt "
        "an existing database."
    )
