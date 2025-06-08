/**
 * Detects and returns what context the script is in.
 */
export function detectScriptType() {
  const hasChromeRuntime = typeof chrome !== 'undefined' && !!chrome.runtime
  const hasWindow = typeof window !== 'undefined'
  // If window is defined but chrome.runtime.id is not the current extension ID,
  // it's an inpage script, not a content script
  const isInjectedInpageScript =
    hasWindow && (!hasChromeRuntime || !chrome.runtime.id)

  if (isInjectedInpageScript) return 'inpage'

  if (hasChromeRuntime && !hasWindow) return 'background'

  if (hasChromeRuntime && hasWindow) {
    const path = window.location.pathname

    if (path.includes('background')) return 'background'
    if (path.includes('contentscript')) return 'contentScript'
    if (path.includes('index')) return 'popup'
    return 'contentScript' // fallback if not explicitly known
  }

  throw new Error('Undetected script.')
}

export type ScriptType = ReturnType<typeof detectScriptType>
