import unittest

import httpx

from app.keitaro import KeitaroClient, KeitaroError


class KeitaroClientTests(unittest.IsolatedAsyncioTestCase):
    async def test_upstream_http_failure_is_logged_and_response_body_is_hidden(self):
        response_body = "upstream internal error"
        transport = httpx.MockTransport(
            lambda _: httpx.Response(502, text=response_body)
        )
        async with httpx.AsyncClient(transport=transport) as http_client:
            client = KeitaroClient(
                "https://tracker.test",
                "secret-api-key",
                http_client=http_client,
            )
            with self.assertLogs("app.keitaro", level="WARNING") as captured:
                with self.assertRaises(KeitaroError) as raised:
                    await client.request("GET", "campaigns")

        self.assertIn("GET campaigns", captured.output[0])
        self.assertNotIn("secret-api-key", captured.output[0])
        self.assertNotIn(response_body, str(raised.exception))
        self.assertEqual(str(raised.exception), "Keitaro ответил HTTP 502")

    async def test_connection_error_does_not_expose_transport_details(self):
        def fail_request(request: httpx.Request) -> httpx.Response:
            raise httpx.ConnectError("private connection detail", request=request)

        transport = httpx.MockTransport(fail_request)
        async with httpx.AsyncClient(transport=transport) as http_client:
            client = KeitaroClient(
                "https://tracker.test",
                "secret-api-key",
                http_client=http_client,
            )
            with self.assertRaises(KeitaroError) as raised:
                await client.request("GET", "campaigns")

        self.assertNotIn("private connection detail", str(raised.exception))
        self.assertNotIn("secret-api-key", str(raised.exception))
        self.assertEqual(
            str(raised.exception),
            "Не удалось связаться с Keitaro (ConnectError)",
        )


if __name__ == "__main__":
    unittest.main()
