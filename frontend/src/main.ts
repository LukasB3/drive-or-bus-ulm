import 'leaflet/dist/leaflet.css'
import { createMap, updateMarkers, getParkingSummary } from './map/map'
import { fetchParkingLots, subscribeToUpdates } from './api/parking'
import { createBusLayer, updateBusMarkers, getAverageDelay } from './map/busLayer'
import { connectBusWebSocket } from './api/bus'
import { createRouteLayer, loadRouteShapes } from './map/routeLayer'
import { fetchRouteShapes } from './api/routes'
import { createHeader, updateBusStats, updateParkingStats, setKnownRoutes } from './header/header'
import { setAllRoutes } from './header/state'

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
    #map {
      left: 0;
      top: 50vh;
      bottom: 0;
    }
  }
`
document.head.appendChild(style)

createHeader()
const map = createMap()

// Parking: initial load + realtime subscription
const lots = await fetchParkingLots()
updateMarkers(lots)
const summary = getParkingSummary()
updateParkingStats(summary.vacant, summary.total, summary.fetchedAt)

subscribeToUpdates(async () => {
  const updated = await fetchParkingLots()
  updateMarkers(updated)
  const s = getParkingSummary()
  updateParkingStats(s.vacant, s.total, s.fetchedAt)
})

// Route shapes: pre-load polylines (shown on bus/tram hover)
createRouteLayer(map)
fetchRouteShapes()
  .then(loadRouteShapes)
  .catch((e) => console.warn('Failed to load route shapes:', e))

// Bus: WebSocket live updates
createBusLayer(map)
let routesInitialized = false
connectBusWebSocket((buses) => {
  if (!routesInitialized) {
    const routeMap = new Map<number, number>()
    for (const b of buses) {
      if (b.routeNumber === 201) continue
      routeMap.set(b.routeNumber, b.category)
    }
    setAllRoutes(new Set(routeMap.keys()))
    setKnownRoutes(routeMap)
    routesInitialized = true
  }

  updateBusMarkers(buses)
  updateBusStats(getAverageDelay())
})
