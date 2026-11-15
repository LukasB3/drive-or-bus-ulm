const WS_BASE = import.meta.env.VITE_WS_URL
  || (import.meta.env.MODE === 'production'
    ? 'wss://api.drive-or-bus.lukasbossert.com'
    : `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`)
const RECONNECT_DELAY_MS = 3000

/** Opens a backend WebSocket that reconnects on close; the server sends its latest snapshot on connect. */
export function connectWebSocket<T>(path: string, onUpdate: (data: T) => void) {
  function connect() {
    const ws = new WebSocket(`${WS_BASE}${path}`)
    ws.onmessage = (event) => onUpdate(JSON.parse(event.data))
    ws.onclose = () => setTimeout(connect, RECONNECT_DELAY_MS)
    ws.onerror = () => ws.close()
  }
  connect()
}
