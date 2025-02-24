type KeysignCompleteInput = {
  serverURL: string
  localPartyId: string
  sessionId: string
  messageId: string
  jsonSignature: string
}
export const markLocalPartyKeysignComplete = async ({
  serverURL,
  localPartyId,
  sessionId,
  messageId,
  jsonSignature,
}: KeysignCompleteInput): Promise<void> => {
  console.log('markLocalPartyKeysignComplete, localPartyId:', localPartyId)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  headers['message_id'] = messageId
  await fetch(`${serverURL}/complete/${sessionId}/keysign`, {
    method: 'POST',
    headers,
    body: jsonSignature,
  })
}
