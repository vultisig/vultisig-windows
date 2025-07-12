import { queryUrl } from '@lib/utils/query/queryUrl'
import { retry } from '@lib/utils/query/retry'
import { withoutUndefinedFields } from '@lib/utils/record/withoutUndefinedFields'

type GetSetupMessageInput = {
  serverUrl: string
  sessionId: string
  messageId?: string
}

const getSetupMessage = async ({
  serverUrl,
  sessionId,
  messageId,
}: GetSetupMessageInput) =>
  queryUrl(`${serverUrl}/setup-message/${sessionId}`, {
    headers: withoutUndefinedFields({
      'Content-Type': 'application/json',
      message_id: messageId,
    }),
    responseType: 'text',
  })

export const waitForSetupMessage = async (
  input: GetSetupMessageInput
): Promise<string> =>
  retry({
    func: () => getSetupMessage(input),
    attempts: 10,
    delay: 1000,
  })
