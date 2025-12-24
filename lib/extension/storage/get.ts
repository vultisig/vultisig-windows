type GetStorageValueFunction = <T>(key: string, initialValue: T) => Promise<T>

export const getStorageValue: GetStorageValueFunction = async <T>(
  key: string,
  initialValue: T
): Promise<T> => {
  const result = await chrome.storage.local.get(key)
  const value = result[key]
  if (value === undefined) {
    return initialValue
  }

  return value as T
}
