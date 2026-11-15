import 'leaflet/dist/leaflet.css'
import { createMap, updateMarkers, getParkingSummary } from './map/map'
import { createBusLayer, updateBusMarkers, getAverageDelay } from './map/busLayer'
import { connectWebSocket } from './api/ws'
import { createRouteLayer, loadRouteShapes } from './map/routeLayer'
import { createHeader, updateBusStats, updateParkingStats, setKnownRoutes } from './header/header'
import { setAllRoutes } from './header/state'
import { isSpecialRoute } from './config'
import type { ParkingLot } from './types/parking'
import type { RouteShape } from './types/route'
import type { BusPosition } from './types/bus'

const style = document.createElement('style')
style.textContent = `
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
  }
  #map {
    position: fixed;
    top: 0;
    left: 280px;
    right: 0;
    bottom: 0;
  }
  @media (max-width: 640px) {
    body {
      display: flex;
      flex-direction: column;
      height: 100dvh;
    }
    #map {
      position: relative;
      left: 0;
      flex: 1;
      min-height: 0;
    }
  }
`
document.head.appendChild(style)

createHeader()
const map = createMap()

// Parking: WebSocket, snapshot on connect and on every backend refresh
connectWebSocket<ParkingLot[]>('/ws/parking', (lots) => {
  updateMarkers(lots)
  const s = getParkingSummary()
  updateParkingStats(s.vacant, s.total, s.fetchedAt)
})

// Route shapes: pre-load polylines (shown on bus/tram hover)
createRouteLayer(map)
connectWebSocket<RouteShape[]>('/ws/routes', loadRouteShapes)

// Bus: WebSocket live updates
createBusLayer(map)
let routesInitialized = false
connectWebSocket<BusPosition[]>('/ws/bus', (buses) => {
  if (!routesInitialized) {
    const routeMap = new Map<number, number>()
    for (const b of buses) {
      if (isSpecialRoute(b.routeNumber)) continue
      routeMap.set(b.routeNumber, b.category)
    }
    setAllRoutes(new Set(routeMap.keys()))
    setKnownRoutes(routeMap)
    routesInitialized = true
  }

  updateBusMarkers(buses)
  updateBusStats(getAverageDelay())
})
