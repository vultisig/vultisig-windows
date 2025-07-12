import { queryUrl } from '@lib/utils/query/queryUrl'
import { retry } from '@lib/utils/query/retry'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

type DownloadSetupMessageInput = {
  serverUrl: string
  sessionId: string
  messageId?: string
}

const downloadSetupMessage = async ({
  serverUrl,
  sessionId,
  messageId,
}: DownloadSetupMessageInput) =>
  queryUrl<string>(`${serverUrl}/setup-message/${sessionId}`, {
    headers: withoutUndefinedFields({
      'Content-Type': 'application/json',
      message_id: messageId,
    }),
    responseType: 'text',
  })

export const waitForSetupMessage = async (
  input: DownloadSetupMessageInput
): Promise<string> =>
  retry({
    func: () => downloadSetupMessage(input),
    attempts: 10,
    delay: 1000,
  })
