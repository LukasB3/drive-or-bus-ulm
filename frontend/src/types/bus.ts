export interface BusPosition {
  vehicleNumber: number
  lat: number
  lon: number
  bearing: number
  routeNumber: number
  direction: string
  deviation: number
  category: number // 1=tram, 5=bus
}
