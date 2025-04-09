import { createPersistentStateHook } from '../lib/ui/state/createPersistentStateHook'
import { LocalStorage } from '../lib/ui/state/LocalStorage'
import { TemporaryStorage } from '../lib/ui/state/TemporaryStorage'

export enum PersistentStateKey {
  CurrentVaultId = 'currentVaultId',
  IsVaultBalanceVisible = 'isVaultBalanceVisible',
  ReactQueryState = 'reactQueryState',
  HasFinishedOnboarding = 'HasFinishedOnboarding',
  Language = 'language',
  FiatCurrency = 'fiatCurrency',
  DefaultChains = 'defaultChains',
  VaultCreationMpcLib = 'vaultCreationMpcLib',
}

const persistentStorage =
  typeof window !== 'undefined'
    ? new LocalStorage<PersistentStateKey>()
    : new TemporaryStorage<PersistentStateKey>()

export const usePersistentState =
  createPersistentStateHook<PersistentStateKey>(persistentStorage)
