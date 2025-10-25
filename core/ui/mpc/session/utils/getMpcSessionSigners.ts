import { queryUrl } from '@lib/utils/query/queryUrl'

type GetMpcSessionSignersInput = {
  serverUrl: string
  sessionId: string
}

export const getMpcSessionSigners = async ({
  serverUrl,
  sessionId,
}: GetMpcSessionSignersInput) =>
  queryUrl<string[]>(`${serverUrl}/start/${sessionId}`)
