import unittest

import httpx

from app.keitaro import KeitaroClient, KeitaroError


class KeitaroClientTests(unittest.IsolatedAsyncioTestCase):
    async def test_list_unwraps_items_and_list_responses(self):
        responses = {
            "/admin_api/v1/offers": httpx.Response(
                200, json={"items": [{"id": 8}]}
            ),
            "/admin_api/v1/domains": httpx.Response(200, json=[{"id": 2}]),
        }
        transport = httpx.MockTransport(
            lambda request: responses[request.url.path]
        )
        async with httpx.AsyncClient(transport=transport) as http_client:
            client = KeitaroClient(
                "https://tracker.test",
                "secret-api-key",
                http_client=http_client,
            )

            self.assertEqual(await client.list("offers"), [{"id": 8}])
            self.assertEqual(await client.list("domains"), [{"id": 2}])

    async def test_empty_success_response_returns_none(self):
        transport = httpx.MockTransport(lambda _: httpx.Response(204))
        async with httpx.AsyncClient(transport=transport) as http_client:
            client = KeitaroClient(
                "https://tracker.test",
                "secret-api-key",
                http_client=http_client,
            )

            self.assertIsNone(await client.request("DELETE", "campaigns/41"))

    async def test_list_rejects_unexpected_response_shape(self):
        transport = httpx.MockTransport(
            lambda _: httpx.Response(200, json={"unexpected": []})
        )
        async with httpx.AsyncClient(transport=transport) as http_client:
            client = KeitaroClient(
                "https://tracker.test",
                "secret-api-key",
                http_client=http_client,
            )

            with self.assertRaisesRegex(KeitaroError, "неожиданный список"):
                await client.list("offers")

    async def test_campaign_list_rejects_malformed_campaigns(self):
        transport = httpx.MockTransport(
            lambda _: httpx.Response(200, json=[{"id": 41}])
        )
        async with httpx.AsyncClient(transport=transport) as http_client:
            client = KeitaroClient(
                "https://tracker.test",
                "secret-api-key",
                http_client=http_client,
            )

            with self.assertRaisesRegex(KeitaroError, "данные для кампании"):
                await client.list("campaigns")

    async def test_campaign_streams_reject_malformed_streams(self):
        transport = httpx.MockTransport(
            lambda _: httpx.Response(
                200,
                json=[{"id": 100, "action_type": "offer", "action_options": "invalid"}],
            )
        )
        async with httpx.AsyncClient(transport=transport) as http_client:
            client = KeitaroClient(
                "https://tracker.test",
                "secret-api-key",
                http_client=http_client,
            )

            with self.assertRaisesRegex(KeitaroError, "данные для потока"):
                await client.campaign_streams(41)

    async def test_metadata_list_rejects_malformed_options(self):
        transport = httpx.MockTransport(
            lambda _: httpx.Response(200, json={"items": [{"name": "Offer"}]})
        )
        async with httpx.AsyncClient(transport=transport) as http_client:
            client = KeitaroClient(
                "https://tracker.test",
                "secret-api-key",
                http_client=http_client,
            )

            with self.assertRaisesRegex(
                KeitaroError, "данные для элемента справочника"
            ):
                await client.list("offers")

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
