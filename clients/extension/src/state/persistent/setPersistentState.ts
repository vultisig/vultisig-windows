export const setPersistentState = async <T>(key: string, value: T) => {
  await chrome.storage.local.set({ [key]: value })

  return value
}
