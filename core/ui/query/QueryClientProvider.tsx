import { ChildrenProp } from '@lib/ui/props'
import {
  queryClientDefaultOptions,
  queryClientGcTime,
} from '@lib/ui/query/queryClientDefaultOptions'
import {
  defaultShouldDehydrateQuery,
  OmitKeyof,
  QueryClient,
} from '@tanstack/react-query'
import {
  Persister,
  PersistQueryClientOptions,
  PersistQueryClientProvider,
} from '@tanstack/react-query-persist-client'
import { useMemo } from 'react'

type QueryClientProps = ChildrenProp & {
  persister: Persister
}

export const QueryClientProvider = ({
  children,
  persister,
}: QueryClientProps) => {
  const queryClient = useMemo(() => {
    return new QueryClient({
      defaultOptions: queryClientDefaultOptions,
    })
  }, [])

  const persistOptions: OmitKeyof<PersistQueryClientOptions, 'queryClient'> =
    useMemo(() => {
      return {
        persister,
        maxAge: queryClientGcTime,
        dehydrateOptions: {
          shouldDehydrateQuery: query => {
            if (query.meta?.disablePersist) {
              return false
            }

            return defaultShouldDehydrateQuery(query)
          },
        },
        buster: 'v2',
      }
    }, [persister])

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
