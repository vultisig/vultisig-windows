import { View } from '@lib/ui/navigation/View'
import { getLastItem } from '@vultisig/lib-utils/array/getLastItem'
import { pick } from '@vultisig/lib-utils/record/pick'

import { AppView, AppViewId } from './AppView'

type ViewState<K extends AppViewId> =
  Extract<AppView, { id: K }> extends { state?: infer S }
    ? NonNullable<S>
    : never

type KeysOfUnion<T> = T extends unknown ? keyof T : never

/**
 * Views the popup may reopen on, each with the state fields it keeps on disk.
 * Everything else in a view's state (form input, amounts, flow data) is
 * dropped before it is persisted.
 */
const persistedStateFields = {
  addressBook: [],
  createAddressBookItem: ['chain'],
  createVaultFolder: [],
  defi: ['protocol'],
  defiChainDetail: ['chain', 'tab'],
  deposit: ['coin', 'action', 'entryPoint'],
  importVault: [],
  manageDefiChains: [],
  manageVaultChains: [],
  referral: [],
  send: ['fromChain', 'coin'],
  settings: [],
  setupVault: ['type', 'skipStationMigration'],
  signCustomMessage: [],
  swap: ['fromCoin', 'toCoin'],
  updateAddressBookItem: ['id'],
  vault: [],
  vaultChainDetail: ['chain'],
  vaultSettings: [],
} as const satisfies {
  [K in AppViewId]?: readonly KeysOfUnion<ViewState<K>>[]
}

type PersistableViewId = keyof typeof persistedStateFields

const persistableViewIds: ReadonlySet<string> = new Set(
  Object.keys(persistedStateFields)
)

const isPersistableViewId = (id: string): id is PersistableViewId =>
  persistableViewIds.has(id)

/**
 * The view the popup should reopen on: the current view with only its
 * allowlisted state, or `null` when the current view must not be persisted.
 */
export const getPersistableView = (history: View[]): View | null => {
  const { id, state } = getLastItem(history)

  if (!isPersistableViewId(id)) {
    return null
  }

  // Key import input holds the seed phrase or private key being imported.
  if (id === 'setupVault' && state?.keyImportInput) {
    return null
  }

  const fields: readonly string[] = persistedStateFields[id]
  if (fields.length === 0) {
    return { id }
  }

  return { id, state: pick(state ?? {}, fields) }
}
