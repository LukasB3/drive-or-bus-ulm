/*
Used to define the types for the parking lot data to ensure robustness
and type safety across the application.*/

export interface ParkingLot {
  id: number
  name: string
  total_spaces: number
  lat: number | null
  lon: number | null
  current_occupancy: number
  vacant_spaces: number
  forecast_occupancy: number | null
  fetched_at: string | null
}
