import { useDeveloperOptionsQuery } from '@clients/extension/src/state/developerOptions'
import { getPlugin } from '@core/ui/plugins/core/get'
import { useQuery } from '@tanstack/react-query'

export const usePluginQuery = (id: string) => {
  const { data: options } = useDeveloperOptionsQuery()
  const { pluginMarketplaceBaseUrl } = options!

  return useQuery({
    queryKey: ['plugin', id],
    queryFn: () => getPlugin(pluginMarketplaceBaseUrl, id),
  })
}
