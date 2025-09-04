import { getPlugin } from '@core/ui/plugins/core/get'
import { useQuery } from '@tanstack/react-query'

export const usePluginQuery = (id: string) => {
  return useQuery({
    queryKey: ['plugin', id],
    queryFn: () => getPlugin(id),
  })
}
