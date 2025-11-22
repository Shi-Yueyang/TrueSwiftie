import asyncio

from django.test import SimpleTestCase


class TestWebsocketRoom(SimpleTestCase):
    """Basic integration test for Channels WebSocket consumer."""

    def test_connect_and_broadcast(self):
        async def inner():
            try:
                from channels.testing import WebsocketCommunicator
                from tsbackend.asgi import application
            except Exception as e:  # pragma: no cover - quick failure context
                raise AssertionError(f"Unable to import Channels testing stack: {e}")

            communicator = WebsocketCommunicator(application, "/ws/ts/dualmode/1/")
            connected, _ = await communicator.connect()
            assert connected is True

            await communicator.send_json_to({"type": "chat", "data": {"text": "hello"}})
            response = await communicator.receive_json_from()
            assert response["type"] == "chat"
            assert response["data"]["text"] == "hello"

            await communicator.disconnect()

        asyncio.run(inner())

    def test_connect_without_trailing_slash(self):
        async def inner():
            from channels.testing import WebsocketCommunicator
            from tsbackend.asgi import application

            communicator = WebsocketCommunicator(application, "/ws/ts/dualmode/1")
            connected, _ = await communicator.connect()
            assert connected is True
            await communicator.disconnect()

        asyncio.run(inner())
