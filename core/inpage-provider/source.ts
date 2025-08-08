export type ProviderSource = 'inpage' | 'background'

export const getProviderSource = (): ProviderSource => {
  const hasChromeRuntime = typeof chrome !== 'undefined' && !!chrome.runtime
  const hasWindow = typeof window !== 'undefined'

  const isInpage = hasWindow && (!hasChromeRuntime || !chrome.runtime.id)
  if (isInpage) return 'inpage'

  const isBackground = hasChromeRuntime && !hasWindow
  if (isBackground) return 'background'

  if (hasWindow && window.location.protocol === 'chrome-extension:') {
    const path = window.location.pathname
    if (path.includes('background')) return 'background'
    throw new Error('Unsupported provider source: extension page')
  }

  throw new Error('Unsupported provider source')
}
