import { attempt } from '@lib/utils/attempt'
import { useQuery } from '@tanstack/react-query'

type RemoteFeatureFlags = Record<string, boolean>

const releaseConfigUrl = 'https://api.vultisig.com/feature/release.json'

const fetchRemoteFeatureFlags = async (): Promise<RemoteFeatureFlags> => {
  const result = await attempt(() =>
    fetch(releaseConfigUrl).then(r => r.json())
  )

  if ('error' in result) {
    return {}
  }

  return result.data
}

const useRemoteFeatureFlagsQuery = () =>
  useQuery({
    queryKey: ['remoteFeatureFlags'],
    queryFn: fetchRemoteFeatureFlags,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

/** Returns true if the remote `tss-batching` flag is explicitly true. */
export const useRemoteTssBatching = () => {
  const { data } = useRemoteFeatureFlagsQuery()

  return data?.['tss-batching'] === true
}
