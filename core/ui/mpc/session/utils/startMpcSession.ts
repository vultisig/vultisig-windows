import { queryUrl } from '@lib/utils/query/queryUrl'

type StartMpcSessionInput = {
  serverUrl: string
  sessionId: string
  signers: string[]
}

export const startMpcSession = async ({
  serverUrl,
  sessionId,
  signers,
}: StartMpcSessionInput) =>
  queryUrl(`${serverUrl}/start/${sessionId}`, {
    body: signers,
    responseType: 'none',
  })
