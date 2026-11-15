from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.ws_manager import WSChannel, bus_channel, parking_channel, routes_channel

router = APIRouter()


async def _serve(channel: WSChannel, ws: WebSocket):
    await channel.connect(ws)
    try:
        while True:
            await ws.receive_text()  # keep connection alive
    except WebSocketDisconnect:
        pass
    finally:
        channel.disconnect(ws)


@router.websocket("/ws/bus")
async def bus_websocket(ws: WebSocket):
    await _serve(bus_channel, ws)


@router.websocket("/ws/parking")
async def parking_websocket(ws: WebSocket):
    await _serve(parking_channel, ws)


@router.websocket("/ws/routes")
async def routes_websocket(ws: WebSocket):
    await _serve(routes_channel, ws)
