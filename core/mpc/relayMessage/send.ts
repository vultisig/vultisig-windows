import { queryUrl } from '@lib/utils/query/queryUrl'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

type SendMessageInput = {
  serverUrl: string
  localPartyId: string
  sessionId: string
  message: string
  to: string
  sequenceNo: number
  messageHash: string
  messageId?: string
}

export const sendRelayMessage = async ({
  serverUrl,
  localPartyId,
  sessionId,
  message,
  to,
  sequenceNo,
  messageHash,
  messageId,
}: SendMessageInput) =>
  queryUrl(`${serverUrl}/message/${sessionId}`, {
    method: 'POST',
    headers: withoutUndefinedFields({
      'Content-Type': 'application/json',
      message_id: messageId,
    }),
    body: JSON.stringify({
      session_id: sessionId,
      from: localPartyId,
      to: [to],
      body: message,
      hash: messageHash,
      sequence_no: sequenceNo,
    }),
    responseType: 'none',
  })
