import { queryUrl } from '@lib/utils/query/queryUrl'

type DownloadSetupMessageInput = {
  serverUrl: string
  sessionId: string
}

export const downloadSetupMessage = async ({
  serverUrl,
  sessionId,
}: DownloadSetupMessageInput) => {
  const msg = await queryUrl<string>(`${serverUrl}/setup-message/${sessionId}`)

  console.log('setup message', msg)

  return msg
}
