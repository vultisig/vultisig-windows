import { GetMpcServerUrlInput, useCore } from '@core/ui/state/core'
import { useQuery } from '@tanstack/react-query'

/**
 * Resolves the MPC server URL for a session. In local mode this runs a 5s mDNS
 * lookup, so retries are disabled: the default 3 retries stretch a single miss
 * into ~30s of spinner. The failure surfaces immediately with a manual retry.
 */
export const useMpcServerUrlQuery = (input: GetMpcServerUrlInput) => {
  const { getMpcServerUrl } = useCore()

  return useQuery({
    queryKey: ['mpcServerUrl', input],
    queryFn: () => getMpcServerUrl(input),
    retry: false,
  })
}
