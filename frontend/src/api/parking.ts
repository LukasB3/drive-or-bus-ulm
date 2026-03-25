import { supabase } from '../supabase'
import type { ParkingLot } from '../types/parking'
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js'

/*
Fetches Parking lot data from Supabase
 */
export async function fetchParkingLots(): Promise<ParkingLot[]> {
  const { data, error } = await supabase.rpc('get_latest_parking_status')
  if (error) throw new Error(`Supabase RPC error: ${error.message}`)
  return data as ParkingLot[]
}

/**
Subscribed to Supabase database. When there are any changes detected, fetchParkingLots
will be called to update the map with the new data
 */
export function subscribeToUpdates(
  onInsert: (payload: RealtimePostgresInsertPayload<Record<string, unknown>>) => void,
) {
  return supabase
    .channel('parking-status-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'parking_status' },
      onInsert,
    )
    .subscribe()
}
