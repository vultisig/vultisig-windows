export const setStorageValue = async <T>(key: string, value: T) => {
  await chrome.storage.local.set({ [key]: value })

  return value
}
