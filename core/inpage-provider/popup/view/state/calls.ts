import { getPersistentState } from '@core/extension/state/persistent/getPersistentState'
import { setPersistentState } from '@core/extension/state/persistent/setPersistentState'

import { PopupCall } from '../../resolver'

const popupViewCallsKey = 'popupViewCalls'

type PopupViewCalls = Record<string, PopupCall<any>>

export const getPopupViewCalls = async () =>
  getPersistentState<PopupViewCalls>(popupViewCallsKey, {})

export const addPopupViewCall = async (call: PopupCall<any>) => {
  const calls = await getPopupViewCalls()

  const id = crypto.randomUUID()

  await setPersistentState(popupViewCallsKey, {
    ...calls,
    [id]: call,
  })

  return id
}
