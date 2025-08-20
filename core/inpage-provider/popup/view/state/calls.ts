import { BridgeContext } from '@lib/extension/bridge/context'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'
import { omit } from '@lib/utils/record/omit'

import { PopupCall } from '../../resolver'

const popupViewCallsKey = 'popupViewCalls'

type PopupViewCallEntry = {
  call: PopupCall<any>
  context?: BridgeContext
}

type PopupViewCalls = Record<string, PopupViewCallEntry>

const getPopupViewCalls = async () =>
  getStorageValue<PopupViewCalls>(popupViewCallsKey, {})

export const addPopupViewCall = async (input: PopupViewCallEntry) => {
  const calls = await getPopupViewCalls()

  const id = crypto.randomUUID()

  await setStorageValue(popupViewCallsKey, {
    ...calls,
    [id]: input,
  })

  return id
}

export const removePopupViewCall = async (id: string) => {
  const calls = await getPopupViewCalls()
  return setStorageValue(popupViewCallsKey, omit(calls, id))
}

export const getPopupViewCall = async (id: string) => {
  const calls = await getPopupViewCalls()
  return calls[id]
}
