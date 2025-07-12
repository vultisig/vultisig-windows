import { queryUrl } from '@lib/utils/query/queryUrl'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

import { RelayMessage } from './RelayMessage'

type GetRelayMessagesInput = {
  serverUrl: string
  localPartyId: string
  sessionId: string
  messageId?: string
}

export const getRelayMessages = async ({
  serverUrl,
  localPartyId,
  sessionId,
  messageId,
}: GetRelayMessagesInput) =>
  queryUrl<RelayMessage[]>(
    `${serverUrl}/message/${sessionId}/${localPartyId}`,
    {
      method: 'GET',
      headers: withoutUndefinedFields({
        'Content-Type': 'application/json',
        message_id: messageId,
      }),
      responseType: 'json',
    }
  )
