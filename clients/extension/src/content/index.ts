import { runBackgroundEventsContentAgent } from '@core/inpage-provider/background/events/content'
import { runBridgeContentAgent } from '@lib/extension/bridge/content'

const insertInpageScript = () => {
  if (document.getElementById('inpage')) {
    return
  }
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('inpage.js')
  script.id = 'inpage'
  script.onload = () => script.remove()
  script.onerror = error => {
    console.error('Failed to load inpage script:', error)
  }
  ;(document.head || document.documentElement).appendChild(script)
}
try {
  runBridgeContentAgent()
  runBackgroundEventsContentAgent()

  insertInpageScript()
} catch (error) {
  console.error('Error setting up extension communications:', error)
}
