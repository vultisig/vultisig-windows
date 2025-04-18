import { assertFetchResponse } from '@lib/utils/fetch/assertFetchResponse'

type JoinMpcSessionInput = {
  serverUrl: string
  sessionId: string
  localPartyId: string
}

export const joinMpcSession = async ({
  serverUrl,
  sessionId,
  localPartyId,
}: JoinMpcSessionInput) => {
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
