import { runBackgroundEventsAgent } from '@core/inpage-provider/background/events/background'
import { runInpageProviderBridgeBackgroundAgent } from '@core/inpage-provider/bridge/background'

if (!navigator.userAgent.toLowerCase().includes('firefox')) {
  ;[
    Object,
    Object.prototype,
    Function,
    Function.prototype,
    Array,
    Array.prototype,
    String,
    String.prototype,
    Number,
    Number.prototype,
    Boolean,
    Boolean.prototype,
  ].forEach(Object.freeze)
}

runInpageProviderBridgeBackgroundAgent()

runBackgroundEventsAgent()

if (import.meta.env.VITE_DEV_RELOAD) {
  const connect = () => {
    const ws = new WebSocket('ws://localhost:18732')
    ws.onmessage = () => chrome.runtime.reload()
    ws.onclose = () => setTimeout(connect, 1000)
  }
  connect()
}
