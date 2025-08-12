import { getPersistentState } from '@core/extension/state/persistent/getPersistentState'
import { removePersistentState } from '@core/extension/state/persistent/removePersistentState'
import { setPersistentState } from '@core/extension/state/persistent/setPersistentState'
import { queriesPersisterKey } from '@core/ui/storage/queriesPersister'
import { Persister } from '@tanstack/react-query-persist-client'

export const queriesPersister: Persister = {
  persistClient: async value => {
    await setPersistentState(queriesPersisterKey, value)
  },
  restoreClient: async () => getPersistentState(queriesPersisterKey, undefined),
  removeClient: () => removePersistentState(queriesPersisterKey),
}
