import { getStorageValue } from '@lib/extension/storage/get'
import { removeStorageValue } from '@lib/extension/storage/remove'
import { setStorageValue } from '@lib/extension/storage/set'
import { View } from '@lib/ui/navigation/View'

const persistedViewKey = 'persistedView'

const isView = (value: unknown): value is View =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  typeof value.id === 'string'

/**
 * Reads the view the popup reopens on. Anything else under the key, like the
 * whole history older versions stored, is ignored.
 */
export const getPersistedView = async (): Promise<View | null> => {
  const value = await getStorageValue<unknown>(persistedViewKey, null)

  return isView(value) ? value : null
}

/** Saves the view the popup reopens on. */
export const setPersistedView = async (view: View) =>
  setStorageValue(persistedViewKey, view)

/** Clears the saved view so the popup opens on its default view. */
export const removePersistedView = async () =>
  removeStorageValue(persistedViewKey)
