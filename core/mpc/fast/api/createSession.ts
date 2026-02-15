import { rootApiUrl } from '@core/config'
import { queryUrl } from '@lib/utils/query/queryUrl'

export const createSession = ({
  sessionId,
  extensionParty,
}: {
  sessionId: string
  extensionParty: string
}) =>
  queryUrl(`${rootApiUrl}/router/${sessionId}`, {
    method: 'POST',
    body: JSON.stringify([extensionParty]),
    responseType: 'none',
  })
