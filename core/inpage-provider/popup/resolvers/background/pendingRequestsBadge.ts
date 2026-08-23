import { attempt } from '@vultisig/lib-utils/attempt'

const badgeBackgroundColor = '#FF5C5C'
const badgeTextColor = '#FFFFFF'

let pendingRequests = 0
let renderQueue: Promise<unknown> = Promise.resolve()

const renderBadge = () => {
  const render = () =>
    attempt(async () => {
      const text = pendingRequests > 0 ? String(pendingRequests) : ''
      await chrome.action.setBadgeText({ text })
      if (!text) return
      await chrome.action.setBadgeBackgroundColor({
        color: badgeBackgroundColor,
      })
      await chrome.action.setBadgeTextColor({ color: badgeTextColor })
    })

  renderQueue = renderQueue.then(render, render)
}

/**
 * Marks a dApp request as awaiting the user and paints the count on the
 * toolbar icon, so a popup window that opened behind the browser is still
 * noticed. The returned callback retires that request; the badge clears only
 * once every pending request has been settled.
 */
export const trackPendingRequest = () => {
  pendingRequests += 1
  renderBadge()

  let isSettled = false

  return () => {
    if (isSettled) return
    isSettled = true
    pendingRequests = Math.max(pendingRequests - 1, 0)
    renderBadge()
  }
}

/**
 * Drops a badge inherited from a previous service worker generation, whose
 * pending requests died along with it.
 */
export const resetPendingRequestsBadge = () => {
  pendingRequests = 0
  renderBadge()
}
