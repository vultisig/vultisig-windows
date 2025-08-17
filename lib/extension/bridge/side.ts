export type BridgeSide = 'inpage' | 'background'

export const getBridgeSide = (): BridgeSide => {
  const hasChromeRuntime = typeof chrome !== 'undefined' && !!chrome.runtime
  const hasWindow = typeof window !== 'undefined'

  const isInpage = hasWindow && (!hasChromeRuntime || !chrome.runtime.id)
  if (isInpage) return 'inpage'

  const isBackground = hasChromeRuntime && !hasWindow
  if (isBackground) return 'background'

  if (hasWindow && window.location.protocol === 'chrome-extension:') {
    const path = window.location.pathname
    if (path.includes('background')) return 'background'
    throw new Error('Unsupported bridge side: extension page')
  }

  throw new Error('Unsupported bridge side')
}
