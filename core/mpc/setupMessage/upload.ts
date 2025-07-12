import { queryUrl } from '@lib/utils/query/queryUrl'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

type UploadSetupMessageInput = {
  serverUrl: string
  message: string
  sessionId: string
  messageId?: string
}

export const uploadSetupMessage = async ({
  serverUrl,
  message,
  sessionId,
  messageId,
}: UploadSetupMessageInput) =>
  queryUrl(`${serverUrl}/setup-message/${sessionId}`, {
    method: 'POST',
    headers: withoutUndefinedFields({
      'Content-Type': 'application/json',
      message_id: messageId,
    }),
    body: message,
    responseType: 'none',
  })
