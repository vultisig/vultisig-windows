import { assertFetchResponse } from '@lib/utils/fetch/assertFetchResponse'

import { fastVaultServerUrl } from '../config'

type Input = {
  public_key: string
  session_id: string
  hex_encryption_key: string
  encryption_password: string
  email: string
}

export const migrateWithServer = async (input: Input) => {
  const url = `${fastVaultServerUrl}/migrate`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  await assertFetchResponse(response)

  return response
}
