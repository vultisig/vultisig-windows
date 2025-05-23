import { createPersistentStateHook } from '../lib/ui/state/createPersistentStateHook'
import { LocalStorage } from '../lib/ui/state/LocalStorage'
import { TemporaryStorage } from '../lib/ui/state/TemporaryStorage'

export enum PersistentStateKey {
  ReactQueryState = 'reactQueryState',
  VaultCreationMpcLib = 'vaultCreationMpcLib',
}

const Storage = typeof window !== 'undefined' ? LocalStorage : TemporaryStorage

export const persistentStorage = new Storage()

export const usePersistentState =
  createPersistentStateHook<PersistentStateKey>(persistentStorage)
