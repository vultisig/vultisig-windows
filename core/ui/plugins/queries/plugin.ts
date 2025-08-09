import { useQuery } from '@tanstack/react-query'

import { getPlugin } from '../core/get'

export const usePluginQuery = (id: string) => {
  return useQuery({
    queryKey: ['plugin', id],
    queryFn: () => getPlugin(id),
  })
}
