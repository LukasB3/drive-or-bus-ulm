from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.ws_manager import BusWSManager

router = APIRouter()

bus_manager: BusWSManager | None = None

def set_manager(manager: BusWSManager):
    global bus_manager
    bus_manager = manager


@router.websocket("/ws/bus")
async def bus_websocket(ws: WebSocket):
    assert bus_manager is not None
    await bus_manager.connect(ws)
    try:
        while True:
            await ws.receive_text()  # keep connection alive
    except WebSocketDisconnect:
        bus_manager.disconnect(ws)
