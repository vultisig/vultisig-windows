import { assertFetchResponse } from '@lib/utils/fetch/assertFetchResponse'

type JoinSessionInput = {
  serverUrl: string
  sessionId: string
  localPartyId: string
}

export const joinSession = async ({
  serverUrl,
  sessionId,
  localPartyId,
}: JoinSessionInput) => {
  const response = await fetch(`${serverUrl}/${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([localPartyId]),
  })

  await assertFetchResponse(response)

  return response
}
