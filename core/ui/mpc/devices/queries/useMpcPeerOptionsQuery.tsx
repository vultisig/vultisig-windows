import { useMpcLocalPartyId } from '@core/ui/mpc/state/mpcLocalPartyId'
import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { pollingQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { without } from '@vultisig/lib-utils/array/without'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

export const useMpcPeerOptionsQuery = () => {
  const sessionId = useMpcSessionId()
  const localPartyId = useMpcLocalPartyId()
  const serverUrl = useMpcServerUrl()

  return useQuery({
    queryKey: ['peerOptions', sessionId, serverUrl],
    queryFn: async () => {
      const response = await queryUrl<string[]>(`${serverUrl}/${sessionId}`)
      if (response.length === 0) {
        throw new Error('No peers found')
      }
      return without(withoutDuplicates(response), localPartyId)
    },
    ...pollingQueryOptions(2000),
  })
}
