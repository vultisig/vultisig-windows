import { setupBridgeMessengerRelay } from '../messengers/bridge'
import { initializeMessenger } from '../messengers/initializeMessenger'
import { getPrioritizeWallet } from '../state/currentSettings/isPrioritized'

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
  insertInpageScript()
  setupBridgeMessengerRelay()
} catch (error) {
  console.error('Error setting up extension communications:', error)
}
const inpageMessenger = initializeMessenger({ connect: 'inpage' })

window.addEventListener('vulticonnect:inpage:ready', async () => {
  inpageMessenger.send('setDefaultProvider', {
    vultisigDefaultProvider: await getPrioritizeWallet(),
  })
})
