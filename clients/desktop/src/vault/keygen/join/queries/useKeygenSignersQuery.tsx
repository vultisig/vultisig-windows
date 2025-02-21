import { isEmpty } from '@lib/utils/array/isEmpty'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery } from '@tanstack/react-query'

import { useCurrentSessionId } from '../../shared/state/currentSessionId'
import { useCurrentServerUrl } from '../../state/currentServerUrl'

export const useKeygenSignersQuery = () => {
  const serverUrl = useCurrentServerUrl()
  const sessionId = useCurrentSessionId()

  return useQuery({
    queryKey: ['keygenSigners', sessionId],
    queryFn: async () => {
      const signers = await queryUrl<string[]>(
        `${serverUrl}/start/${sessionId}`
      )

      const uniqueSigners = withoutDuplicates(signers)

      if (isEmpty(uniqueSigners)) {
        throw new Error('Session have not started yet')
      }

      return uniqueSigners
    },
    retry: true,
    retryDelay: 1000,
    meta: {
      disablePersist: true,
    },
  })
}
