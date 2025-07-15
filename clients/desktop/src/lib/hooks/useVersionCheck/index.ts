import { useCore } from '@core/ui/state/core'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery } from '@tanstack/react-query'

import { productReleasesApiUrl } from '../../../versioning/config'
import { isValidVersion, isVersionNewer } from './utils'

export const useVersionCheck = () => {
  const { version } = useCore()

  return useQuery({
    queryKey: ['latestVersion'],
    queryFn: async () => {
      const { tag_name } = await queryUrl<{ tag_name: string }>(
        productReleasesApiUrl
      )

      const latestVersion = tag_name.startsWith('v')
        ? tag_name.slice(1)
        : tag_name

      if (!isValidVersion(version)) {
        throw new Error(`Invalid latest version format: ${version}`)
      }

      const updateAvailable = isVersionNewer({
        remoteVersion: latestVersion,
        localVersion: version,
      })

      return { version, updateAvailable }
    },
  })
}
