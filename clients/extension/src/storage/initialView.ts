import { AppView } from '@clients/extension/src/navigation/AppView'
import { getPersistentState } from '@core/extension/state/persistent/getPersistentState'
import { removePersistentState } from '@core/extension/state/persistent/removePersistentState'
import { setPersistentState } from '@core/extension/state/persistent/setPersistentState'

const initialViewKey = 'initialView'

export const getInitialView = async () =>
  getPersistentState<AppView | null>(initialViewKey, null)

export const setInitialView = async (view: AppView) =>
  setPersistentState(initialViewKey, view)

export const removeInitialView = async () =>
  removePersistentState(initialViewKey)
