import { useMpcServerUrl } from '@core/ui/mpc/state/mpcServerUrl'
import { useMpcSessionId } from '@core/ui/mpc/state/mpcSession'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { isEmpty } from '@lib/utils/array/isEmpty'
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

      if (isEmpty(signers)) {
        throw new Error('Session have not started yet')
      }

      return signers
    },
    retry: true,
    retryDelay: 1000,
    ...noRefetchQueryOptions,
  })
}
