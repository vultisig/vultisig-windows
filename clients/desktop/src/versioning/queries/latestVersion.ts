import { useQuery } from '@tanstack/react-query'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

import { productReleasesApiUrl } from '../config'

export const useLatestVersionQuery = () => {
  return useQuery({
    queryKey: ['latestVersion'],
    queryFn: async () => {
      const { tag_name } = await queryUrl<{ tag_name: string }>(
        productReleasesApiUrl
      )

      return tag_name.startsWith('v') ? tag_name.slice(1) : tag_name
    },
  })
}
