import { assertFetchResponse } from '@lib/utils/fetch/assertFetchResponse'

type UploadPayloadToServerInput = {
  serverUrl: string
  hash: string
}

export async function getPayloadFromServer({
  hash,
  serverUrl,
}: UploadPayloadToServerInput): Promise<string> {
  const url = `${serverUrl}/payload/${hash}`

  const response = await fetch(url)

  await assertFetchResponse(response)

  return response.text()
}
