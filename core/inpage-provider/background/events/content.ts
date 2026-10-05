import { isBackgroundEventMessage } from './core'

/** Origin of a sandboxed or `data:` frame, which `postMessage` rejects as a target. */
const opaqueOrigin = 'null'

/**
 * Relays background events from the extension to the page's inpage agent.
 * Frames with an opaque origin (e.g. sandboxed ad iframes) are skipped: no
 * dApp provider runs there, and posting to them throws.
 */
export const runBackgroundEventsContentAgent = () => {
  chrome.runtime.onMessage.addListener(msg => {
    if (!isBackgroundEventMessage(msg)) return

    if (window.origin === opaqueOrigin) return

    window.postMessage(msg, window.origin)
  })
}
