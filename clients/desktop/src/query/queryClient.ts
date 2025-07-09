import {
  queryClientDefaultOptions,
  queryClientGcTime,
} from '@lib/ui/query/queryClientDefaultOptions'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

import { PersistentStateKey } from '../state/persistentState'

export const getQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: queryClientDefaultOptions,
  })

  const localStoragePersistor = createSyncStoragePersister({
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    key: PersistentStateKey.ReactQueryState,
  })

  persistQueryClient({
    queryClient,
    persister: localStoragePersistor,
    maxAge: queryClientGcTime,
    dehydrateOptions: {
      shouldDehydrateQuery: query => {
        if (query.meta?.disablePersist) {
          return false
        }

        return defaultShouldDehydrateQuery(query)
      },
    },
    buster: 'v1',
  })

  return queryClient
}
