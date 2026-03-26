import { supabase } from '../supabase'
import type { RouteShape } from '../types/route'

export async function fetchRouteShapes(): Promise<RouteShape[]> {
  const { data, error } = await supabase.rpc('get_route_shapes')
  if (error) throw new Error(`Supabase RPC error: ${error.message}`)
  return data as RouteShape[]
}
