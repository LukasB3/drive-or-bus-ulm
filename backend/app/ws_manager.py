import asyncio

from fastapi import WebSocket

from app.logger import logger


class BusWSManager:
    def __init__(self):
        self.connections: set[WebSocket] = set()
        self.last_broadcast: str | None = None
        self._fetch_event = asyncio.Event()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        first_client = len(self.connections) == 0
        self.connections.add(ws)
        logger.info(f"Bus WS client connected ({len(self.connections)} total)")
        if self.last_broadcast:
            await ws.send_text(self.last_broadcast)
        if first_client:
            self._fetch_event.set()

    def disconnect(self, ws: WebSocket):
        self.connections.discard(ws)
        logger.info(f"Bus WS client disconnected ({len(self.connections)} total)")
        if not self.connections:
            self.last_broadcast = None

    async def broadcast(self, data: str):
        dead: list[WebSocket] = []
        for ws in self.connections:
            try:
                await ws.send_text(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.connections.discard(ws)
