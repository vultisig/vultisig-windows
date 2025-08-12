export const removePersistentState = async (key: string) => {
  await chrome.storage.local.remove(key)
}
