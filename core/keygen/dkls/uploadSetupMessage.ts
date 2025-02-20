import { assertFetchResponse } from '@lib/utils/fetch/assertFetchResponse'

type UploadSetupMessageInput = {
  serverUrl: string
  message: string
  sessionId: string
}

export const uploadSetupMessage = async ({
  serverUrl,
  message,
  sessionId,
}: UploadSetupMessageInput) => {
  const response = await fetch(`${serverUrl}/setup-message/${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: message,
  })

  await assertFetchResponse(response)

  return response
}
