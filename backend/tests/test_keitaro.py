import unittest
from unittest.mock import patch

import httpx

from app.keitaro import KeitaroClient, KeitaroError


class KeitaroClientTests(unittest.IsolatedAsyncioTestCase):
    async def test_upstream_http_failure_is_logged_without_credentials(self):
        response_body = "upstream internal error"
        transport = httpx.MockTransport(
            lambda _: httpx.Response(502, text=response_body)
        )
        real_async_client = httpx.AsyncClient
        client = KeitaroClient("https://tracker.test", "secret-api-key")

        with patch(
            "app.keitaro.httpx.AsyncClient",
            side_effect=lambda **kwargs: real_async_client(
                transport=transport, **kwargs
            ),
        ):
            with self.assertLogs("app.keitaro", level="WARNING") as captured:
                with self.assertRaisesRegex(KeitaroError, "HTTP 502"):
                    await client.request("GET", "campaigns")

        self.assertIn("GET campaigns", captured.output[0])
        self.assertNotIn("secret-api-key", captured.output[0])


if __name__ == "__main__":
    unittest.main()
