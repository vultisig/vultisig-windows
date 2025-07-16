import { queryUrl } from '@lib/utils/query/queryUrl'

type UploadPayloadToServerInput = {
  serverUrl: string
  hash: string
}

export const getPayloadFromServer = ({
  hash,
  serverUrl,
}: UploadPayloadToServerInput) =>
  queryUrl(`${serverUrl}/payload/${hash}`, { responseType: 'text' })
