import { queryUrl } from '@lib/utils/query/queryUrl'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

import { MpcRelayMessage } from '.'

type SendMpcRelayMessageInput = {
  serverUrl: string
  sessionId: string
  messageId?: string
  message: MpcRelayMessage
}

export const sendMpcRelayMessage = async ({
  serverUrl,
  sessionId,
  message,
  messageId,
}: SendMpcRelayMessageInput) =>
  queryUrl(`${serverUrl}/message/${sessionId}`, {
    headers: withoutUndefinedFields({
      message_id: messageId,
    }),
    body: message,
    responseType: 'none',
  })
