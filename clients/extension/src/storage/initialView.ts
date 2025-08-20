import { AppView } from '@clients/extension/src/navigation/AppView'
import { getStorageValue } from '@lib/extension/storage/get'
import { removeStorageValue } from '@lib/extension/storage/remove'
import { setStorageValue } from '@lib/extension/storage/set'

const initialViewKey = 'initialView'

export const getInitialView = async () =>
  getStorageValue<AppView | null>(initialViewKey, null)

export const setInitialView = async (view: AppView) =>
  setStorageValue(initialViewKey, view)

export const removeInitialView = async () => removeStorageValue(initialViewKey)
