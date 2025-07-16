import { queryUrl } from '@lib/utils/query/queryUrl'
import crypto from 'crypto'

type UploadPayloadToServerInput = {
  serverUrl: string
  payload: string
}

export async function uploadPayloadToServer({
  payload,
  serverUrl,
}: UploadPayloadToServerInput): Promise<string> {
  const hash = crypto.createHash('sha256').update(payload).digest('hex')
  const url = `${serverUrl}/payload/${hash}`

  await queryUrl(url, {
    body: payload,
    responseType: 'none',
  })

  return hash
}
