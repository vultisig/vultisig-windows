import { setupBridgeMessengerRelay } from '../messengers/bridge'

const insertInpageScript = () => {
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('inpage.js')
  script.id = 'inpage'
  script.onload = () => script.remove()
  ;(document.head || document.documentElement).appendChild(script)
}

insertInpageScript()
setupBridgeMessengerRelay()
