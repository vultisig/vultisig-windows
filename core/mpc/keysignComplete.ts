import { queryUrl } from '@lib/utils/query/queryUrl'

import { KeysignSignature } from './keysign/KeysignSignature'

type KeysignCompleteInput = {
  serverUrl: string
  sessionId: string
  messageId: string
  result: KeysignSignature
}

export const markLocalPartyKeysignComplete = async ({
  serverUrl,
  sessionId,
  messageId,
  result,
}: KeysignCompleteInput) =>
  queryUrl(`${serverUrl}/complete/${sessionId}/keysign`, {
    headers: {
      message_id: messageId,
    },
    body: result,
    responseType: 'none',
  })
