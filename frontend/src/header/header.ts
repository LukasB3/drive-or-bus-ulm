import './header.css'
import { lineColor } from '../map/colors'
import {
  toggleRoute, isRouteVisible, setRoutesVisible, toggleParking, isParkingVisible,
} from './state'

let parkingTimestampEl: HTMLElement
let parkingOccupancyEl: HTMLElement
let parkingSummaryEl: HTMLElement
let parkingFreeEl: HTMLElement
let parkingToggle: HTMLInputElement
let linienTimestampEl: HTMLElement
let linienSummaryEl: HTMLElement
let delayBadgeEl: HTMLElement
let routeListEl: HTMLElement

export function createHeader() {
  const sidebar = document.createElement('aside')
  sidebar.className = 'sidebar'
  sidebar.innerHTML = `
    <div class="sidebar-title">Ulm: Auto oder Bus?</div>
    <div class="sidebar-desc">
      Live-Karte der Ulmer Parkhäuser und Bus-/Straßenbahnpositionen.
      Parkdaten werden alle 5 Minuten aktualisiert, Fahrzeugpositionen alle 15 Sekunden.
    </div>

    <div class="sidebar-section" id="sb-section-parking">
      <button class="section-toggle" aria-expanded="false">
        <span class="section-toggle-left">
          <span class="section-title">Parken</span>
          <span class="section-timestamp" id="sb-parking-ts">–</span>
        </span>
        <span class="section-toggle-right">
          <span class="section-summary" id="sb-parking-summary">–</span>
          <span class="section-chevron">▼</span>
        </span>
      </button>
      <div class="section-body">
        <div class="stats-row">
          <span class="stat-label">Auslastung</span>
          <span class="stat-value stat-value--highlight" id="sb-parking-occ">–</span>
        </div>
        <div class="stats-row">
          <span class="stat-label">Freie Plätze</span>
          <span class="stat-value" id="sb-parking-free">–</span>
        </div>
        <div class="toggle-row">
          <span class="toggle-label">Parkhäuser anzeigen</span>
          <label class="toggle-switch">
            <input type="checkbox" checked id="sb-parking-toggle" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>

    <div class="sidebar-section" id="sb-section-linien">
      <button class="section-toggle" aria-expanded="false">
        <span class="section-toggle-left">
          <span class="section-title">Linien</span>
          <span class="section-timestamp" id="sb-linien-ts">–</span>
        </span>
        <span class="section-toggle-right">
          <span class="section-summary" id="sb-linien-summary">–</span>
          <span class="section-chevron">▼</span>
        </span>
      </button>
      <div class="section-body">
        <div class="stats-row">
          <span class="stat-label">Ø Verspätung</span>
          <span id="sb-delay-badge"><span class="delay-badge delay-badge--good">–</span></span>
        </div>
        <div class="route-list" id="sb-route-list"></div>
      </div>
    </div>
  `
  const footer = document.createElement('div')
  footer.className = 'sidebar-footer'
  footer.textContent = 'Created by Lukas B.'
  sidebar.appendChild(footer)

  document.body.prepend(sidebar)

  parkingTimestampEl = document.getElementById('sb-parking-ts')!
  parkingOccupancyEl = document.getElementById('sb-parking-occ')!
  parkingSummaryEl = document.getElementById('sb-parking-summary')!
  parkingFreeEl = document.getElementById('sb-parking-free')!
  linienTimestampEl = document.getElementById('sb-linien-ts')!
  linienSummaryEl = document.getElementById('sb-linien-summary')!
  delayBadgeEl = document.getElementById('sb-delay-badge')!
  routeListEl = document.getElementById('sb-route-list')!

  parkingToggle = document.getElementById('sb-parking-toggle') as HTMLInputElement
  parkingToggle.checked = isParkingVisible()
  parkingToggle.addEventListener('change', () => toggleParking())

  // Collapsible section toggles
  for (const section of sidebar.querySelectorAll<HTMLElement>('.sidebar-section')) {
    const btn = section.querySelector('.section-toggle')!
    btn.addEventListener('click', (e) => {
      // Don't collapse when clicking the parking toggle inside the section
      if ((e.target as HTMLElement).closest('.toggle-switch')) return
      section.classList.toggle('open')
      const expanded = section.classList.contains('open')
      btn.setAttribute('aria-expanded', String(expanded))
    })
  }
}

function delayBadgeHtml(avgDelaySec: number, small = false): string {
  const absSec = Math.abs(avgDelaySec)
  const mins = Math.floor(absSec / 60)
  const secs = Math.round(absSec % 60)
  const sign = avgDelaySec > 0 ? '+' : avgDelaySec < 0 ? '-' : ''
  const label = avgDelaySec === 0
    ? 'pünktlich'
    : `${sign}${mins}:${secs.toString().padStart(2, '0')} m`

  const cls = absSec <= 30 ? 'good' : absSec <= 120 ? 'warn' : 'bad'
  const smCls = small ? ' delay-badge--sm' : ''
  return `<span class="delay-badge delay-badge--${cls}${smCls}">${label}</span>`
}

export function updateParkingStats(vacant: number, total: number, fetchedAt: string | null) {
  const pct = total > 0 ? Math.round(((total - vacant) / total) * 100) : 0
  parkingOccupancyEl.textContent = `${pct}%`
  parkingOccupancyEl.style.color = pct >= 80 ? '#f87171' : pct >= 50 ? '#facc15' : '#4ade80'
  parkingFreeEl.textContent = `${vacant} / ${total}`
  parkingSummaryEl.textContent = `${pct}%`
  parkingSummaryEl.style.color = pct >= 80 ? '#f87171' : pct >= 50 ? '#facc15' : '#4ade80'

  if (fetchedAt) {
    const time = new Date(fetchedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    parkingTimestampEl.textContent = time
  }
}

export function updateBusStats(avgDelaySec: number) {
  delayBadgeEl.innerHTML = delayBadgeHtml(avgDelaySec)
  linienSummaryEl.innerHTML = delayBadgeHtml(avgDelaySec, true)

  linienTimestampEl.textContent = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function setKnownRoutes(routeMap: Map<number, number>) {
  const trams: number[] = []
  const buses: number[] = []

  for (const [route, category] of routeMap) {
    if (route === 201) continue
    if (category === 1) trams.push(route)
    else buses.push(route)
  }

  trams.sort((a, b) => a - b)
  buses.sort((a, b) => a - b)

  routeListEl.innerHTML = ''

  if (trams.length) {
    routeListEl.appendChild(buildGroupLabel('Straßenbahnen', trams))
    for (const r of trams) routeListEl.appendChild(buildRouteItem(r))
  }
  if (buses.length) {
    routeListEl.appendChild(buildGroupLabel('Busse', buses))
    for (const r of buses) routeListEl.appendChild(buildRouteItem(r))
  }
}

function buildGroupLabel(label: string, routes: number[]): HTMLElement {
  const div = document.createElement('div')
  div.className = 'route-group-label'

  const span = document.createElement('span')
  span.textContent = label

  const btn = document.createElement('button')
  btn.textContent = 'alle'
  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    const allVisible = routes.every(r => isRouteVisible(r))
    setRoutesVisible(routes, !allVisible)
    for (const r of routes) {
      const cb = document.getElementById(`sb-route-${r}`) as HTMLInputElement | null
      if (cb) cb.checked = !allVisible
    }
  })

  div.append(span, btn)
  return div
}

function buildRouteItem(route: number): HTMLElement {
  const label = document.createElement('label')
  label.className = 'route-item'

  const dot = document.createElement('span')
  dot.className = 'route-dot'
  dot.style.background = lineColor(route)

  const text = document.createElement('span')
  text.textContent = `Linie ${route}`

  const cb = document.createElement('input')
  cb.type = 'checkbox'
  cb.checked = isRouteVisible(route)
  cb.id = `sb-route-${route}`
  cb.addEventListener('change', (e) => {
    e.stopPropagation()
    toggleRoute(route)
  })

  label.append(dot, text, cb)
  return label
}
