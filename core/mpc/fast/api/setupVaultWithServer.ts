import { queryUrl } from '@lib/utils/query/queryUrl'

import { fastVaultServerUrl } from '../config'

type Input = {
  name: string
  session_id: string
  hex_encryption_key: string
  hex_chain_code: string
  local_party_id: string
  encryption_password: string
  email: string
  protocols: string[]
  public_key?: string
}

export const setupVaultWithServer = async (input: Input) =>
  queryUrl(`${fastVaultServerUrl}/batch/keygen`, {
    body: input,
    responseType: 'none',
  })
