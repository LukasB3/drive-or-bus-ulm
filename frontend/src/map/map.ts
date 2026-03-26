import L from 'leaflet'
import { MAP_CENTER, MAP_ZOOM } from '../config'
import { occupancyColor } from './colors'
import type { ParkingLot } from '../types/parking'
import { isParkingVisible, subscribe } from '../header/state'

const markers = new Map<number, L.Marker>()
let map: L.Map
let latestLots: ParkingLot[] = []

// Inject parking marker styles once
const parkingStyle = document.createElement('style')
parkingStyle.textContent = `
  .parking-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.4);
    border-radius: 6px;
    border: 2px solid rgba(255,255,255,0.5);
    box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    line-height: 1;
    white-space: nowrap;
  }
  .parking-tooltip {
    font-family: system-ui, sans-serif;
    padding: 6px 10px !important;
    font-size: 13px;
    line-height: 1.4;
    border-radius: 6px !important;
  }
  .parking-tooltip b {
    font-size: 14px;
  }
`
document.head.appendChild(parkingStyle)

export function createMap(): L.Map {
  map = L.map('map').setView(MAP_CENTER, MAP_ZOOM)

  L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 20,
  }).addTo(map)

  subscribe(() => {
    const visible = isParkingVisible()
    for (const marker of markers.values()) {
      if (visible) marker.addTo(map)
      else marker.remove()
    }
  })

  return map
}

export function getParkingSummary(): { vacant: number; total: number; fetchedAt: string | null } {
  let vacant = 0, total = 0
  let fetchedAt: string | null = null
  for (const lot of latestLots) {
    vacant += lot.vacant_spaces
    total += lot.total_spaces
    if (lot.fetched_at && (!fetchedAt || lot.fetched_at > fetchedAt)) {
      fetchedAt = lot.fetched_at
    }
  }
  return { vacant, total, fetchedAt }
}

function buildIcon(lot: ParkingLot): L.DivIcon {
  const pct = lot.total_spaces > 0 ? lot.current_occupancy / lot.total_spaces : 0
  const color = occupancyColor(pct)
  const label = `${lot.vacant_spaces}`
  const w = label.length >= 3 ? 34 : 28
  const h = 22

  return L.divIcon({
    className: '',
    iconSize: [w, h],
    iconAnchor: [w / 2, h / 2],
    html: `<div class="parking-icon" style="background:${color};width:${w}px;height:${h}px">P ${label}</div>`,
  })
}

function buildTooltip(lot: ParkingLot): string {
  const pct = lot.total_spaces > 0
    ? Math.round((lot.current_occupancy / lot.total_spaces) * 100)
    : 0
  const color = occupancyColor(pct / 100)
  const updated = lot.fetched_at
    ? new Date(lot.fetched_at).toLocaleTimeString('de-DE')
    : '—'

  return `<b style="color:${color}">${lot.name}</b><br>${lot.vacant_spaces} / ${lot.total_spaces} frei<br>Auslastung: ${pct}%<br><span style="opacity:0.7;font-size:11px">Stand: ${updated}</span>`
}

export function updateMarkers(lots: ParkingLot[]) {
  latestLots = lots
  const visible = isParkingVisible()

  for (const lot of lots) {
    if (lot.lat == null || lot.lon == null) continue

    const existing = markers.get(lot.id)
    if (existing) {
      existing.setIcon(buildIcon(lot))
      existing.setTooltipContent(buildTooltip(lot))
    } else {
      const marker = L.marker([lot.lat, lot.lon], { icon: buildIcon(lot) })
        .bindTooltip(buildTooltip(lot), {
          className: 'parking-tooltip',
          direction: 'top',
          offset: [0, -12],
        })

      if (visible) marker.addTo(map)
      markers.set(lot.id, marker)
    }
  }
}
