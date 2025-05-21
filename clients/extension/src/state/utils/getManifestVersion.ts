export const getManifestVersion = (): string => {
  return chrome.runtime.getManifest().version
}
