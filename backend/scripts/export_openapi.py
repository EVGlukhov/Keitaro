import json
import sys
from pathlib import Path


backend_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_root))

from app.main import app


schema_path = backend_root / "openapi.json"
schema_path.write_text(
    json.dumps(app.openapi(), indent=2, ensure_ascii=False) + "\n",
    encoding="utf-8",
)
