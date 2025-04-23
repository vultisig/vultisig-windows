import { useVersion } from '@core/ui/product/state/version'
import { attempt, withFallback } from '@lib/utils/attempt'
import { useQuery } from '@tanstack/react-query'

import { LATEST_VERSION_QUERY_KEY, VULTISIG_RELEASES_API } from './constants'
import { isValidVersion, isVersionNewer } from './utils'

const useVersionCheck = () => {
  const localVersion = useVersion()
  const {
    data: latestVersionData,
    error: remoteError,
    isFetching: isRemoteFetching,
  } = useQuery({
    queryKey: [LATEST_VERSION_QUERY_KEY],
    queryFn: async () => {
      const response = await fetch(VULTISIG_RELEASES_API)
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
        localVersion,
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
