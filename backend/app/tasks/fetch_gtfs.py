import asyncio
import csv
import io
import zipfile

import httpx

from app.config import settings
from app.database import supabase
from app.logger import logger

"""
Downloads the SWU GTFS feed weekly and upserts route shape polylines
into the route_shapes Supabase table.
"""

ROUTE_TYPE_TO_CATEGORY = {0: 1, 900: 1}
BUS_CATEGORY = 5


def _parse_csv(text: str) -> list[dict[str, str]]:
    return list(csv.DictReader(io.StringIO(text)))


def _process_gtfs(zip_bytes: bytes) -> list[dict]:
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        routes_raw = _parse_csv(zf.read("routes.txt").decode("utf-8-sig"))
        trips_raw = _parse_csv(zf.read("trips.txt").decode("utf-8-sig"))
        shapes_raw = _parse_csv(zf.read("shapes.txt").decode("utf-8-sig"))

    # route_id → (route_number, category)
    route_info: dict[str, tuple[int, int]] = {}
    for r in routes_raw:
        try:
            num = int(r["route_short_name"])
        except (ValueError, KeyError):
            continue
        rt = int(r.get("route_type", 3))
        category = ROUTE_TYPE_TO_CATEGORY.get(rt, BUS_CATEGORY)
        route_info[r["route_id"]] = (num, category)

    # Pick one shape_id per (route_id, direction_id)
    route_dir_shape: dict[tuple[str, str], str] = {}
    for t in trips_raw:
        key = (t["route_id"], t.get("direction_id", "0"))
        if key not in route_dir_shape and t.get("shape_id"):
            route_dir_shape[key] = t["shape_id"]

    # shape_id → sorted [[lat, lon], ...]
    shape_points: dict[str, list[tuple[int, float, float]]] = {}
    for s in shapes_raw:
        sid = s["shape_id"]
        shape_points.setdefault(sid, []).append((
            int(s["shape_pt_sequence"]),
            float(s["shape_pt_lat"]),
            float(s["shape_pt_lon"]),
        ))

    # Build final rows
    rows: list[dict] = []
    seen: set[tuple[int, str]] = set()
    for (route_id, dir_id), shape_id in route_dir_shape.items():
        if route_id not in route_info:
            continue
        route_number, category = route_info[route_id]
        direction = "inbound" if dir_id == "0" else "outbound"

        key = (route_number, direction)
        if key in seen:
            continue
        seen.add(key)

        points = shape_points.get(shape_id, [])
        points.sort(key=lambda p: p[0])
        coordinates = [[lat, lon] for _, lat, lon in points]

        if not coordinates:
            continue

        rows.append({
            "route_number": route_number,
            "direction": direction,
            "category": category,
            "coordinates": coordinates,
        })

    return rows


async def fetch_and_sync_gtfs():
    async with httpx.AsyncClient(timeout=60, verify=False) as client:
        try:
            response = await client.get(settings.GTFS_URL)
            response.raise_for_status()

            rows = _process_gtfs(response.content)

            if rows:
                supabase.table("route_shapes").upsert(
                    rows, on_conflict="route_number,direction"
                ).execute()

            logger.info(f"Synced {len(rows)} route shapes from GTFS.")

        except Exception as e:
            logger.error(f"Failed to sync GTFS route shapes: {e}")


async def gtfs_loop():
    logger.info("Starting weekly GTFS route shapes sync...")
    await fetch_and_sync_gtfs()
    while True:
        await asyncio.sleep(settings.GTFS_FETCH_INTERVAL_SECONDS)
        await fetch_and_sync_gtfs()
