import type { BusPosition } from '../types/bus'

const WS_URL = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws/bus`
const RECONNECT_DELAY_MS = 3000

export function connectBusWebSocket(onUpdate: (buses: BusPosition[]) => void) {
  let ws: WebSocket

  function connect() {
    ws = new WebSocket(WS_URL)

    ws.onmessage = (event) => {
      const buses: BusPosition[] = JSON.parse(event.data)
      onUpdate(buses)
    }

    ws.onclose = () => {
      setTimeout(connect, RECONNECT_DELAY_MS)
    }

    ws.onerror = () => {
      ws.close()
    }
  }

  connect()
}
