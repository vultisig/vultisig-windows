import { VaultAppSession } from '@core/extension/storage/appSessions'
import { BridgeContext } from '@lib/extension/bridge/context'
import { getStorageValue } from '@lib/extension/storage/get'
import { removeStorageValue } from '@lib/extension/storage/remove'
import { setStorageValue } from '@lib/extension/storage/set'

import { PopupCall } from '../../resolver'

// Each pending call gets its own storage key. The background adds calls and
// the popup window removes them, from two separate JavaScript contexts, so a
// shared record rewritten on every change would let concurrent writers drop
// each other's calls, and no in-memory lock spans both contexts.
const getPopupViewCallKey = (id: string) => `popupViewCall:${id}`

type PopupViewCallEntry = {
  call: PopupCall<any>
  context?: BridgeContext & { appSession?: VaultAppSession }
}

/** Stores a pending popup call and returns the id its popup window loads it by. */
export const addPopupViewCall = async (input: PopupViewCallEntry) => {
  const id = crypto.randomUUID()

  await setStorageValue(getPopupViewCallKey(id), input)

  return id
}

/** Drops a pending popup call once its popup window has loaded it. */
export const removePopupViewCall = (id: string) =>
  removeStorageValue(getPopupViewCallKey(id))

/** Returns the pending popup call stored under this id, if there is one. */
export const getPopupViewCall = (id: string) =>
  getStorageValue<PopupViewCallEntry | undefined>(
    getPopupViewCallKey(id),
    undefined
  )
