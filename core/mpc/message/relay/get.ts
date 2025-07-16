import { queryUrl } from '@lib/utils/query/queryUrl'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

import { MpcRelayMessage } from '.'

type GetMpcRelayMessagesInput = {
  serverUrl: string
  localPartyId: string
  sessionId: string
  messageId?: string
}

export const getMpcRelayMessages = async ({
  serverUrl,
  localPartyId,
  sessionId,
  messageId,
}: GetMpcRelayMessagesInput) =>
  queryUrl<MpcRelayMessage[]>(
    `${serverUrl}/message/${sessionId}/${localPartyId}`,
    {
      headers: withoutUndefinedFields({
        message_id: messageId,
      }),
      responseType: 'json',
    }
  )
