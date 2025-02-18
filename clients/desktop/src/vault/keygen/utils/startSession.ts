import { assertFetchResponse } from '@lib/utils/fetch/assertFetchResponse'

type StartSessionInput = {
  serverUrl: string
  sessionId: string
  devices: string[]
}

export const startSession = async ({
  serverUrl,
  sessionId,
  devices,
}: StartSessionInput) => {
  const response = await fetch(`${serverUrl}/start/${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(devices),
  })

  await assertFetchResponse(response)

  return response
}
