import 'leaflet/dist/leaflet.css'
import { createMap, updateMarkers } from './map/map'
import { fetchParkingLots, subscribeToUpdates } from './api/parking'
import { createBusLayer, updateBusMarkers } from './map/busLayer'
import { connectBusWebSocket } from './api/bus'
import { createRouteLayer, loadRouteShapes } from './map/routeLayer'
import { fetchRouteShapes } from './api/routes'

const style = document.createElement('style')
style.textContent = `
  html, body, #map {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
  }
`
document.head.appendChild(style)

const map = createMap()

// Parking: initial load + realtime subscription
const lots = await fetchParkingLots()
updateMarkers(lots)

subscribeToUpdates(async () => {
  const updated = await fetchParkingLots()
  updateMarkers(updated)
})

// Route shapes: pre-load polylines (shown on bus/tram hover)
createRouteLayer(map)
fetchRouteShapes()
  .then(loadRouteShapes)
  .catch((e) => console.warn('Failed to load route shapes:', e))

// Bus: WebSocket live updates
createBusLayer(map)
connectBusWebSocket(updateBusMarkers)
