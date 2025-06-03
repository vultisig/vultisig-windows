import { useCore } from '@core/ui/state/core'
import { attempt, withFallback } from '@lib/utils/attempt'
import { useQuery } from '@tanstack/react-query'

import { productReleasesApiUrl } from '../../../versioning/config'
import { isValidVersion, isVersionNewer } from './utils'

const useVersionCheck = () => {
  const { version } = useCore()

  const {
    data: latestVersionData,
    error: remoteError,
    isFetching: isRemoteFetching,
  } = useQuery({
    queryKey: ['latestVersion'],
    queryFn: async () => {
      const response = await fetch(productReleasesApiUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch latest version data.')
      }

      const data = await response.json()
      const tagName = data?.tag_name || ''
      const version = tagName.startsWith('v') ? tagName.slice(1) : tagName

      if (!isValidVersion(version)) {
        throw new Error(`Invalid latest version format: ${version}`)
      }
      return { version }
    },
  })

  const latestVersion = latestVersionData?.version

  const updateAvailable = withFallback(
    attempt(() => {
      return isVersionNewer({
        remoteVersion: latestVersion,
        localVersion: version,
      })
    }),
    false
  )

  return {
    latestVersion,
    updateAvailable,
    remoteError,
    isLoading: isRemoteFetching,
  }
}

export default useVersionCheck
