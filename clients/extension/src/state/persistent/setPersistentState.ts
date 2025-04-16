import { PersistentStateKey } from './PersistentStateKey'

export const setPersistentState = async <T>(
  key: PersistentStateKey,
  value: T
) => {
  await chrome.storage.local.set({ [key]: value })

  return value
}
