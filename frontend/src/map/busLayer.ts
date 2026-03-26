import L from 'leaflet'
import type { BusPosition } from '../types/bus'
import { lineColor } from './colors'
import { showRoute, hideRoute } from './routeLayer'

const markers = new Map<number, L.Marker>()
const markerRoute = new Map<number, number>()
let layerGroup: L.LayerGroup
let activeRoute: number | null = null
let hoverCount = 0

// Inject styles once
const style = document.createElement('style')
style.textContent = `
  .bus-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 1px 1px rgba(0,0,0,0.3);
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.4);
    line-height: 1;
    white-space: nowrap;
  }
  .bus-icon--tram {
    border-radius: 3px;
    border: 2px solid rgba(255,255,255,0.6);
  }
  .bus-icon--bus {
    border-radius: 8px;
    border: 2px solid rgba(255,255,255,0.4);
  }
  .bus-tooltip {
    font-family: system-ui, sans-serif;
    padding: 6px 10px !important;
    font-size: 13px;
    line-height: 1.4;
    border-radius: 6px !important;
  }
  .bus-tooltip b {
    font-size: 14px;
  }
`
document.head.appendChild(style)

export function createBusLayer(map: L.Map) {
  layerGroup = L.layerGroup().addTo(map)
}

function formatDelay(seconds: number): string {
  const abs = Math.abs(seconds)
  const mins = Math.floor(abs / 60)
  const secs = abs % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function buildIcon(bus: BusPosition): L.DivIcon {
  const color = lineColor(bus.routeNumber)
  const isTram = bus.category === 1
  const shape = isTram ? 'tram' : 'bus'
  const w = bus.routeNumber >= 10 ? 26 : 22
  const h = 20

  return L.divIcon({
    className: '',
    iconSize: [w, h],
    iconAnchor: [w / 2, h / 2],
    html: `<div class="bus-icon bus-icon--${shape}" style="background:${color};width:${w}px;height:${h}px">${bus.routeNumber}</div>`,
  })
}

function buildTooltip(bus: BusPosition): string {
  const type = bus.category === 1 ? 'Tram' : 'Bus'
  const color = lineColor(bus.routeNumber)
  const onTime = bus.deviation <= 0
  const delayColor = onTime ? '#2a9d3a' : '#d32f2f'
  const delayLabel = bus.deviation === 0
    ? 'pünktlich'
    : `${bus.deviation > 0 ? '+' : '-'}${formatDelay(bus.deviation)}`

  return `<b style="color:${color}">${type} ${bus.routeNumber}</b><br>${bus.direction}<br><span style="color:${delayColor};font-weight:600">${delayLabel}</span>`
}

export function updateBusMarkers(buses: BusPosition[]) {
  const activeIds = new Set<number>()

  for (const bus of buses) {
    activeIds.add(bus.vehicleNumber)

    const existing = markers.get(bus.vehicleNumber)
    if (existing) {
      existing.setLatLng([bus.lat, bus.lon])
      existing.setIcon(buildIcon(bus))
      existing.setTooltipContent(buildTooltip(bus))
      markerRoute.set(bus.vehicleNumber, bus.routeNumber)
    } else {
      const route = bus.routeNumber
      const marker = L.marker([bus.lat, bus.lon], { icon: buildIcon(bus) })
        .bindTooltip(buildTooltip(bus), {
          className: 'bus-tooltip',
          direction: 'top',
          offset: [0, -12],
        })
        .on('mouseover', () => {
          if (activeRoute === route) { hoverCount++; return }
          if (activeRoute !== null) hideRoute(activeRoute)
          activeRoute = route
          hoverCount = 1
          showRoute(route)
        })
        .on('mouseout', () => {
          if (activeRoute !== route) return
          hoverCount--
          if (hoverCount <= 0) {
            hideRoute(route)
            activeRoute = null
            hoverCount = 0
          }
        })

      marker.addTo(layerGroup)
      markers.set(bus.vehicleNumber, marker)
      markerRoute.set(bus.vehicleNumber, route)
    }
  }

  for (const [id, marker] of markers) {
    if (!activeIds.has(id)) {
      layerGroup.removeLayer(marker)
      markers.delete(id)
      markerRoute.delete(id)
    }
  }
}
