/**
 * If extension storage is retained across removal and reinstall, start from a clean state.
 * Updates keep vaults and sessions intact.
 */
export const registerFreshInstallStorageClear = (): void => {
  chrome.runtime.onInstalled.addListener(details => {
    if (details.reason !== 'install') {
      return
    }

    clearStorageForFreshInstall().catch(console.error)
  })
}

const clearStorageForFreshInstall = async (): Promise<void> => {
  await chrome.storage.local.clear()

  const session = chrome.storage.session
  if (session) {
    await session.clear()
  }
}
