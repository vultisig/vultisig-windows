import { queriesPersisterKey } from '@core/ui/storage/queriesPersister'
import { getStorageValue } from '@lib/extension/storage/get'
import { removeStorageValue } from '@lib/extension/storage/remove'
import { setStorageValue } from '@lib/extension/storage/set'
import { Persister } from '@tanstack/react-query-persist-client'

export const queriesPersister: Persister = {
  persistClient: async value => {
    await setStorageValue(queriesPersisterKey, value)
  },
  restoreClient: async () => getStorageValue(queriesPersisterKey, undefined),
  removeClient: () => removeStorageValue(queriesPersisterKey),
}
