export const MAP_CENTER: [number, number] = [48.39841, 9.99155]
export const MAP_ZOOM = 15

// Route numbers from 200 up are special trips (Sonderfahrt), not regular lines
export const isSpecialRoute = (routeNumber: number) => routeNumber >= 200
