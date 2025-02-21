import { queryUrl } from '@lib/utils/query/queryUrl'

type DownloadSetupMessageInput = {
  serverUrl: string
  sessionId: string
}

export const downloadSetupMessage = async ({
  serverUrl,
  sessionId,
}: DownloadSetupMessageInput) =>
  queryUrl<string>(`${serverUrl}/setup-message/${sessionId}`)
