import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { isEmpty } from '@lib/utils/array/isEmpty'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery } from '@tanstack/react-query'

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
