import { assertFetchResponse } from '@lib/utils/fetch/assertFetchResponse'

import { fastVaultServerUrl } from '../config'

type Input = {
  name: string
  session_id: string
  public_key?: string
  hex_encryption_key: string
  hex_chain_code: string
  local_party_id: string
  old_parties: string[]
  old_reshare_prefix: string
  encryption_password: string
  email: string
}

export const reshareWithServer = async (input: Input) => {
  const url = `${fastVaultServerUrl}/reshare`

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
