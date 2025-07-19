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
  lib_type: number
}

export const setupVaultWithServer = async (input: Input) =>
  queryUrl(`${fastVaultServerUrl}/create`, {
    body: input,
    responseType: 'none',
  })
