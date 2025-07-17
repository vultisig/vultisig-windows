type GetPersistentStateFunction = <T>(
  key: string,
  initialValue: T
) => Promise<T>

export const getPersistentState: GetPersistentStateFunction = async (
  key,
  initialValue
) => {
  const result = await chrome.storage.local.get(key)
  const value = result[key]
  if (value === undefined) {
    return initialValue
  }

  return value
}
