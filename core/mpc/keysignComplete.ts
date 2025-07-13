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
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      message_id: messageId,
    },
    body: JSON.stringify(result),
    responseType: 'none',
  })
