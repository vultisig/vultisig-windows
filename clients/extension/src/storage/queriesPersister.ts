import { queriesPersisterKey } from '@core/ui/storage/queriesPersister'
import { Persister } from '@tanstack/react-query-persist-client'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { removePersistentState } from '../state/persistent/removePersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

export const queriesPersister: Persister = {
  persistClient: async value => {
    await setPersistentState(queriesPersisterKey, value)
  },
  restoreClient: async () => getPersistentState(queriesPersisterKey, undefined),
  removeClient: () => removePersistentState(queriesPersisterKey),
}
