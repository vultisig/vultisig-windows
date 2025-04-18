import { assertFetchResponse } from '@lib/utils/fetch/assertFetchResponse'

import { fastVaultServerUrl } from '../config'

type Input = {
  public_key: string
  messages: string[]
  session: string
  hex_encryption_key: string
  derive_path: string
  is_ecdsa: boolean
  vault_password: string
}

export const signWithServer = async (input: Input) => {
  const url = `${fastVaultServerUrl}/sign`

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
