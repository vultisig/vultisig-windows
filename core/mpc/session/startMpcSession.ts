import { queryUrl } from '@lib/utils/query/queryUrl'

type StartMpcSessionInput = {
  serverUrl: string
  sessionId: string
  devices: string[]
}

export const startMpcSession = async ({
  serverUrl,
  sessionId,
  devices,
}: StartMpcSessionInput) =>
  queryUrl(`${serverUrl}/start/${sessionId}`, {
    body: devices,
    responseType: 'none',
  })
