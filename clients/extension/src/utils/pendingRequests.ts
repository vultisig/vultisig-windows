import { getPersistentState } from '@core/extension/state/persistent/getPersistentState'
import { setPersistentState } from '@core/extension/state/persistent/setPersistentState'
import {
  noPersistQueryOptions,
  noRefetchQueryOptions,
} from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'

import { AccountsProps, PluginRequestProps } from './interfaces'

type StoredRequestType = {
  accounts?: AccountsProps
  plugin?: PluginRequestProps
}

type StoredRequestKey = keyof StoredRequestType

const defaultStoredRequest: StoredRequestType = {}

const getStoredPendingRequest = async <K extends StoredRequestKey>(
  key: K
): Promise<StoredRequestType[K]> => {
  const data = await getPersistentState<StoredRequestType>(
    'storedRequest',
    defaultStoredRequest
  )

  const result = data[key]
  if (result === undefined) {
    throw new Error(`No ${key} request found`)
  }

  return result
}

export const setStoredPendingRequest = async <K extends StoredRequestKey>(
  key: K,
  value: StoredRequestType[K]
): Promise<void> => {
  const current = await getPersistentState<StoredRequestType>(
    'storedRequest',
    defaultStoredRequest
  )
  const updated: StoredRequestType = {
    ...current,
    [key]: value,
  }
  await setPersistentState('storedRequest', updated)
}

export const useStoredPendingRequestQuery = <K extends StoredRequestKey>(
  key: K
) =>
  useQuery({
    queryKey: ['storedRequest', key],
    queryFn: () => getStoredPendingRequest(key),
    ...noRefetchQueryOptions,
    ...noPersistQueryOptions,
  })
