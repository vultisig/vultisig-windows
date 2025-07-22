export function isExtensionEnv(): boolean {
  return !!(
    typeof chrome !== 'undefined' &&
    chrome.runtime &&
    chrome.runtime.id
  )
}
