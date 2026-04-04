const isProd = import.meta.env.MODE === 'production'

export const SUPABASE_URL = (isProd
  ? import.meta.env.VITE_SUPABASE_PROD_URL
  : import.meta.env.VITE_SUPABASE_DEV_URL) as string

export const SUPABASE_ANON_KEY = (isProd
  ? import.meta.env.VITE_SUPABASE_PROD_ANON_KEY
  : import.meta.env.VITE_SUPABASE_DEV_ANON_KEY) as string

export const MAP_CENTER: [number, number] = [48.39841, 9.99155]
export const MAP_ZOOM = 15
