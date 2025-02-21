import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery } from '@tanstack/react-query'

import { useCurrentSessionId } from '../../shared/state/currentSessionId'
import { useCurrentServerUrl } from '../../state/currentServerUrl'

export const useSessionStartQuery = () => {
  const serverUrl = useCurrentServerUrl()
  const sessionId = useCurrentSessionId()

  return useQuery({
    queryKey: ['sessionStart', sessionId],
    queryFn: () => {
      return queryUrl(`${serverUrl}/start/${sessionId}`)
    },
    retry: true,
    retryDelay: 1000,
    meta: {
      disablePersist: true,
    },
  })
}
