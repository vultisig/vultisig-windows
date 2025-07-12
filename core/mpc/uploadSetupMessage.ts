import { assertFetchResponse } from '@lib/utils/fetch/assertFetchResponse'

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
}: UploadSetupMessageInput): Promise<void> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (messageId) {
    headers['message_id'] = messageId
  }

  const response = await fetch(`${serverUrl}/setup-message/${sessionId}`, {
    method: 'POST',
    headers,
    body: message,
  })

  await assertFetchResponse(response)
}
