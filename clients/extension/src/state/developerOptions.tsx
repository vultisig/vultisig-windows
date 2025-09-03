import { pluginMarketplaceBaseUrl } from '@core/ui/plugins/config'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from '@tanstack/react-query'

export type DeveloperOptionsProps = {
  pluginMarketplaceBaseUrl: string
}

const isDeveloperOptionsQueryKey = ['developerOptions']
const [key] = isDeveloperOptionsQueryKey

const setDeveloperOptions = async (options: DeveloperOptionsProps) => {
  await setStorageValue<DeveloperOptionsProps>(key, options)
}

export const getDeveloperOptions = async () => {
  return getStorageValue<DeveloperOptionsProps>(key, {
    pluginMarketplaceBaseUrl,
  })
}

export const useDeveloperOptionsQuery = () => {
  return useQuery({
    queryKey: isDeveloperOptionsQueryKey,
    queryFn: getDeveloperOptions,
  })
}

export const useSetDeveloperOptionsMutation = (
  options?: UseMutationOptions<any, any, DeveloperOptionsProps, unknown>
) => {
  const invalidate = useInvalidateQueries()

  return useMutation({
    mutationFn: async options => {
      await setDeveloperOptions(options)
      return options
    },
    onSuccess: async () => {
      await invalidate(isDeveloperOptionsQueryKey)
    },
    ...options,
  })
}
