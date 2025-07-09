import { queriesPersisterKey } from '@core/ui/storage/queriesPersister'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

export const queriesPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: queriesPersisterKey,
})
