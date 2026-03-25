import 'leaflet/dist/leaflet.css'
import { createMap, updateMarkers } from './map/map'
import { fetchParkingLots, subscribeToUpdates } from './api/parking'

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

createMap()

// Initial load
const lots = await fetchParkingLots()
updateMarkers(lots)

// Realtime: re-fetch all when new status rows arrive
subscribeToUpdates(async () => {
  const updated = await fetchParkingLots()
  updateMarkers(updated)
})
