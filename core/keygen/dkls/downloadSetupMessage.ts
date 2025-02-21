import { assertFetchResponse } from '@lib/utils/fetch/assertFetchResponse'

type DownloadSetupMessageInput = {
  serverUrl: string
  sessionId: string
}

export const downloadSetupMessage = async ({
  serverUrl,
  sessionId,
}: DownloadSetupMessageInput) => {
  const response = await fetch(`${serverUrl}/setup-message/${sessionId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })

  await assertFetchResponse(response)

  return response.text()
}
