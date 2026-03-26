type Listener = () => void

const visibleRoutes = new Set<number>()
let allKnownRoutes = new Set<number>()
let parkingVisible = true
const listeners: Listener[] = []

export function subscribe(fn: Listener) { listeners.push(fn) }
function notify() { listeners.forEach(fn => fn()) }

export function setAllRoutes(routes: Set<number>) {
  allKnownRoutes = routes
  visibleRoutes.clear()
  for (const r of routes) visibleRoutes.add(r)
}

export function getAllKnownRoutes(): ReadonlySet<number> { return allKnownRoutes }
export function getVisibleRoutes(): ReadonlySet<number> { return visibleRoutes }
export function isRouteVisible(route: number): boolean { return visibleRoutes.has(route) }

export function toggleRoute(route: number) {
  if (visibleRoutes.has(route)) visibleRoutes.delete(route)
  else visibleRoutes.add(route)
  notify()
}

export function setRoutesVisible(routes: number[], visible: boolean) {
  for (const r of routes) {
    if (visible) visibleRoutes.add(r)
    else visibleRoutes.delete(r)
  }
  notify()
}

export function isParkingVisible(): boolean { return parkingVisible }

export function toggleParking() {
  parkingVisible = !parkingVisible
  notify()
}
