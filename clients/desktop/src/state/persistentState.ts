import { PersistentStateKey } from '@core/ui/state/PersistentStateKey'

import { createPersistentStateHook } from '../lib/ui/state/createPersistentStateHook'
import { LocalStorage } from '../lib/ui/state/LocalStorage'
import { TemporaryStorage } from '../lib/ui/state/TemporaryStorage'
const persistentStorage =
  typeof window !== 'undefined'
    ? new LocalStorage<PersistentStateKey>()
    : new TemporaryStorage<PersistentStateKey>()

export const usePersistentState =
  createPersistentStateHook<PersistentStateKey>(persistentStorage)
