import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

import { PopupCall } from '../../resolver'

const popupViewCallsKey = 'popupViewCalls'

type PopupViewCalls = Record<string, PopupCall<any>>

const getPopupViewCalls = async () =>
  getStorageValue<PopupViewCalls>(popupViewCallsKey, {})

export const addPopupViewCall = async (call: PopupCall<any>) => {
  const calls = await getPopupViewCalls()

  const id = crypto.randomUUID()

  await setStorageValue(popupViewCallsKey, {
    ...calls,
    [id]: call,
  })

  return id
}
