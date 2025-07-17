import { queriesPersisterKey } from '@core/ui/storage/queriesPersister'
import { getPersistentState } from '@lib/ui/state/persistent/getPersistentState'
import { removePersistentState } from '@lib/ui/state/persistent/removePersistentState'
import { setPersistentState } from '@lib/ui/state/persistent/setPersistentState'
import { Persister } from '@tanstack/react-query-persist-client'

export const queriesPersister: Persister = {
  persistClient: async value => {
    await setPersistentState(queriesPersisterKey, value)
  },
  restoreClient: async () => getPersistentState(queriesPersisterKey, undefined),
  removeClient: () => removePersistentState(queriesPersisterKey),
}
