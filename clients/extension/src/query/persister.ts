import { queryClientPersistKey } from '@core/ui/storage/config'
import type { Persister } from '@tanstack/react-query-persist-client'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { removePersistentState } from '../state/persistent/removePersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

export const createChromeStoragePersister = (): Persister => {
  return {
    persistClient: async value => {
      await setPersistentState(queryClientPersistKey, value)
    },
    restoreClient: async () =>
      getPersistentState(queryClientPersistKey, undefined),
    removeClient: () => removePersistentState(queryClientPersistKey),
  }
}
