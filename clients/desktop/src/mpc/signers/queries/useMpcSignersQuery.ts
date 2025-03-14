import { isEmpty } from '@lib/utils/array/isEmpty'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery } from '@tanstack/react-query'

import { useMpcServerUrl } from '../../serverType/state/mpcServerUrl'
import { useMpcSessionId } from '../../session/state/mpcSession'

export const useMpcSignersQuery = () => {
  const serverUrl = useMpcServerUrl()
  const sessionId = useMpcSessionId()

  return useQuery({
    queryKey: ['mpcSigners', sessionId],
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
