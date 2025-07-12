import { assertFetchResponse } from '@lib/utils/fetch/assertFetchResponse'
import { retry } from '@lib/utils/query/retry'

type DownloadSetupMessageInput = {
  serverUrl: string
  sessionId: string
  messageId?: string
}

const downloadSetupMessage = async ({
  serverUrl,
  sessionId,
  messageId,
}: DownloadSetupMessageInput): Promise<string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (messageId) {
    headers['message_id'] = messageId
  }
  const response = await fetch(`${serverUrl}/setup-message/${sessionId}`, {
    headers,
  })

  await assertFetchResponse(response)

  return response.text()
}

export const waitForSetupMessage = async (
  input: DownloadSetupMessageInput
): Promise<string> =>
  retry({
    func: () => downloadSetupMessage(input),
    attempts: 10,
    delay: 1000,
  })
