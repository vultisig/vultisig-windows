import { getDeveloperOptions } from '@core/extension/storage/developerOptions'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useQuery } from '@tanstack/react-query'

export const useDeveloperOptionsQuery = () =>
  useQuery({
    queryKey: [StorageKey.developerOptions],
    queryFn: getDeveloperOptions,
  })
