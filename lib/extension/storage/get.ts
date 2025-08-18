type GetStorageValueFunction = <T>(key: string, initialValue: T) => Promise<T>

export const getStorageValue: GetStorageValueFunction = async (
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
