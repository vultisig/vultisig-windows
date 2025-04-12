import { setupBridgeMessengerRelay } from '../messengers/bridge'

// This fake import is for Knip static analysis only.
// It ensures that dependencies inside inpage.ts are not marked as unused.
// It has no effect on runtime because the script is injected dynamically.
// eslint-disable-next-line no-constant-condition
if (false) {
  import('../inpage/index.ts')
}

const insertInpageScript = () => {
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('inpage.js')
  script.id = 'inpage'
  script.onload = () => script.remove()
  ;(document.head || document.documentElement).appendChild(script)
}

insertInpageScript()
setupBridgeMessengerRelay()
