import { AppView } from '@clients/extension/src/navigation/AppView'
import { getStorageValue } from '@lib/extension/storage/get'
import { removeStorageValue } from '@lib/extension/storage/remove'

const initialViewKey = 'initialView'

export const getInitialView = async () =>
  getStorageValue<AppView | null>(initialViewKey, null)

export const removeInitialView = async () => removeStorageValue(initialViewKey)
