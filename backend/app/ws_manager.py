import asyncio

from fastapi import WebSocket

from app.logger import logger


class WSChannel:
    """Sends the latest message to each client on connect and pushes every update to all clients."""

    def __init__(self, name: str):
        self.name = name
        self.connections: set[WebSocket] = set()
        self.last_broadcast: str | None = None

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.add(ws)
        logger.info(f"{self.name} WS client connected ({len(self.connections)} total)")
        if self.last_broadcast:
            await ws.send_text(self.last_broadcast)

    def disconnect(self, ws: WebSocket):
        self.connections.discard(ws)
        logger.info(f"{self.name} WS client disconnected ({len(self.connections)} total)")

    async def broadcast(self, data: str):
        self.last_broadcast = data
        for ws in list(self.connections):
            try:
                await ws.send_text(data)
            except Exception:
                self.connections.discard(ws)


class BusWSManager(WSChannel):
    """Bus positions are only fetched while at least one client is connected."""

    def __init__(self):
        super().__init__("Bus")
        self._fetch_event = asyncio.Event()

    async def connect(self, ws: WebSocket):
        first_client = not self.connections
        await super().connect(ws)
        if first_client:
            self._fetch_event.set()

    def disconnect(self, ws: WebSocket):
        super().disconnect(ws)
        if not self.connections:
            self.last_broadcast = None


bus_channel = BusWSManager()
parking_channel = WSChannel("Parking")
routes_channel = WSChannel("Routes")
