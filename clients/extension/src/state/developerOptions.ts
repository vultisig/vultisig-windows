import { DeveloperOptions } from '@clients/extension/src/components/developer-options'
import { pluginMarketplaceBaseUrl } from '@core/ui/plugins/config'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from '@tanstack/react-query'

const developerOptionsQueryKey = ['developerOptions']
const [key] = developerOptionsQueryKey

const setDeveloperOptions = async (options: DeveloperOptions) => {
  await setStorageValue<DeveloperOptions>(key, options)
}

const getDeveloperOptions = async () => {
  return getStorageValue<DeveloperOptions>(key, {
    pluginMarketplaceBaseUrl,
  })
}

export const useDeveloperOptionsQuery = () => {
  return useQuery({
    queryKey: developerOptionsQueryKey,
    queryFn: getDeveloperOptions,
  })
}

export const useSetDeveloperOptionsMutation = (
  options?: UseMutationOptions<any, any, DeveloperOptions, unknown>
) => {
  const invalidate = useInvalidateQueries()

  return useMutation({
    mutationFn: async options => {
      await setDeveloperOptions(options)
      return options
    },
    onSuccess: async () => {
      await invalidate(developerOptionsQueryKey)
    },
    ...options,
  })
}
