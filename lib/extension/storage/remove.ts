export const removeStorageValue = async (key: string) => {
  await chrome.storage.local.remove(key)
}
