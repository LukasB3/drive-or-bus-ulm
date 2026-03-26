import L from 'leaflet'
import type { RouteShape } from '../types/route'
import { lineColor } from './colors'

let map: L.Map
const polylines = new Map<number, L.Polyline[]>()

export function createRouteLayer(leafletMap: L.Map) {
  map = leafletMap
}

export function loadRouteShapes(shapes: RouteShape[]) {
  for (const shape of shapes) {
    const color = lineColor(shape.route_number)
    const latlngs: L.LatLngTuple[] = shape.coordinates.map(
      ([lat, lon]) => [lat, lon] as L.LatLngTuple,
    )

    const line = L.polyline(latlngs, {
      color,
      weight: 4,
      opacity: 0.6,
      interactive: false,
    })

    const existing = polylines.get(shape.route_number) ?? []
    existing.push(line)
    polylines.set(shape.route_number, existing)
  }
}

export function showRoute(routeNumber: number) {
  const lines = polylines.get(routeNumber)
  if (!lines) return
  for (const line of lines) line.addTo(map)
}

export function hideRoute(routeNumber: number) {
  const lines = polylines.get(routeNumber)
  if (!lines) return
  for (const line of lines) line.remove()
}
