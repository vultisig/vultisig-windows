import { VaultsAppSessions } from '@core/extension/storage/appSessions'
import { CurrentVaultId } from '@core/ui/storage/currentVaultId'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'

import {
  getSiteSessionsState,
  resolveSiteSessions,
  SiteSessions,
  SiteSessionsState,
} from '../core/appSession'
import { getEvmChainChangedEvents } from './getEvmChainChangedEvents'
import { getSiteSessionEvents } from './getSiteSessionEvents'
import { sendEventToApp } from './sendEventToApp'

/** Storage keys whose changes can change the session serving a site. */
export const siteSessionStorageKeys: string[] = [
  StorageKey.currentVaultId,
  StorageKey.appSessions,
  StorageKey.vaults,
]

type StorageChanges = Record<string, chrome.storage.StorageChange>

type GetOldValueInput<T> = {
  changes: StorageChanges
  key: StorageKey
  currentValue: T
  initialValue: T
}

const getOldValue = <T>({
  changes,
  key,
  currentValue,
  initialValue,
}: GetOldValueInput<T>): T =>
  key in changes
    ? ((changes[key].oldValue as T | undefined) ?? initialValue)
    : currentValue

type GetStateBeforeChangesInput = {
  state: SiteSessionsState
  changes: StorageChanges
}

/** The state before `changes`, rebuilt from their old values. */
const getStateBeforeChanges = ({
  state,
  changes,
}: GetStateBeforeChangesInput): SiteSessionsState => ({
  sessions: getOldValue<VaultsAppSessions>({
    changes,
    key: StorageKey.appSessions,
    currentValue: state.sessions,
    initialValue: {},
  }),
  currentVaultId: getOldValue<CurrentVaultId>({
    changes,
    key: StorageKey.currentVaultId,
    currentValue: state.currentVaultId,
    initialValue: null,
  }),
  vaultIds:
    getOldValue<Vault[] | undefined>({
      changes,
      key: StorageKey.vaults,
      currentValue: undefined,
      initialValue: [],
    })?.map(getVaultId) ?? state.vaultIds,
})

/**
 * Creates the handler that tells sites when the session serving them changed:
 * `disconnect` when no vault serves a site anymore, `accountsChanged` when
 * another vault does, `evmChainChanged` when its EVM chain changed. Storage
 * listeners run concurrently, so changes are processed one at a time and each
 * one diffs what apps were last told against storage as it is now; a burst of
 * changes therefore sends each event once. The first change after the worker
 * starts diffs against the state its old values describe.
 */
export const createSiteSessionNotifier = () => {
  let lastSiteSessions: SiteSessions | undefined
  let queue: Promise<void> = Promise.resolve()

  const notify = async (changes: StorageChanges) => {
    const state = await getSiteSessionsState()
    const prevSiteSessions =
      lastSiteSessions ??
      resolveSiteSessions(getStateBeforeChanges({ state, changes }))
    const nextSiteSessions = resolveSiteSessions(state)
    lastSiteSessions = nextSiteSessions

    const { disconnect, accountsChanged } = getSiteSessionEvents({
      prevSiteSessions,
      nextSiteSessions,
    })

    for (const appId of disconnect) {
      sendEventToApp({ appId, event: 'disconnect', value: undefined })
    }

    for (const appId of accountsChanged) {
      sendEventToApp({ appId, event: 'accountsChanged', value: undefined })
    }

    for (const { appId, chainId } of getEvmChainChangedEvents({
      prevSessions: prevSiteSessions,
      nextSessions: nextSiteSessions,
    })) {
      sendEventToApp({ appId, event: 'evmChainChanged', value: chainId })
    }
  }

  return (changes: StorageChanges) => {
    const next = queue.then(() => notify(changes))
    queue = next.catch(() => undefined)
    return next
  }
}
