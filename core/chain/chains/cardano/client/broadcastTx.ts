import { isInError } from '@lib/utils/error/isInError'
import { assertFetchResponse } from '@lib/utils/fetch/assertFetchResponse'

import { cardanoApiUrl } from './config'

export const broadcastCardanoTx = async (tx: string) => {
  const response = await fetch(`${cardanoApiUrl}/submittx`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/cbor',
    },
    body: tx,
  })

  await assertFetchResponse(response)

  const result = await response.text()

  if (isInError(result, 'badinputsutxo', 'error')) {
    throw new Error(result)
  }
}
