import { pollingQueryOptions } from '@lib/ui/query/utils/options'
import { without } from '@lib/utils/array/without'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery } from '@tanstack/react-query'

import { useMpcLocalPartyId } from '../../../../../mpc/localPartyId/state/mpcLocalPartyId'
import { useMpcServerUrl } from '../../../../../mpc/serverType/state/mpcServerUrl'
import { useMpcSessionId } from '../../../../../mpc/session/state/mpcSession'

export const usePeerOptionsQuery = ({ enabled = true } = {}) => {
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
    enabled,
    ...pollingQueryOptions(2000),
  })
}
