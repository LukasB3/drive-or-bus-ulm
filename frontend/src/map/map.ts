import L from 'leaflet'
import { MAP_CENTER, MAP_ZOOM } from '../config'
import { occupancyColor } from './colors'
import type { ParkingLot } from '../types/parking'

const markers = new Map<number, L.CircleMarker>()
let map: L.Map

export function createMap(): L.Map {
  map = L.map('map').setView(MAP_CENTER, MAP_ZOOM)

  // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  //   maxZoom: 19,
  // }).addTo(map)

  L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 20,
  }).addTo(map)

  // L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  //   maxZoom: 20,
  // }).addTo(map)

  return map
}

function buildPopup(lot: ParkingLot): string {
  const pct = lot.total_spaces > 0
    ? Math.round((lot.current_occupancy / lot.total_spaces) * 100)
    : 0
  const updated = lot.fetched_at
    ? new Date(lot.fetched_at).toLocaleTimeString('de-DE')
    : '—'

  return `
    <strong>${lot.name}</strong><br>
    ${lot.vacant_spaces} / ${lot.total_spaces} frei<br>
    Auslastung: ${pct}%<br>
    <small>Stand: ${updated}</small>
  `
}

export function updateMarkers(lots: ParkingLot[]) {
  for (const lot of lots) {
    if (lot.lat == null || lot.lon == null) continue

    const pct = lot.total_spaces > 0
      ? lot.current_occupancy / lot.total_spaces
      : 0
    const color = occupancyColor(pct)

    const existing = markers.get(lot.id)
    if (existing) {
      existing.setStyle({ fillColor: color, color })
      existing.setPopupContent(buildPopup(lot))
    } else {
      const marker = L.circleMarker([lot.lat, lot.lon], {
        radius: 12,
        fillColor: color,
        color,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .bindPopup(buildPopup(lot))
        .addTo(map)

      markers.set(lot.id, marker)
    }
  }
}
