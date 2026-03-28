import { queryUrl } from '@lib/utils/query/queryUrl'

import { fastVaultServerUrl } from '../config'

type Input = {
  public_key?: string
  session_id: string
  hex_encryption_key: string
  local_party_id: string
  encryption_password: string
  email?: string
  old_parties: string[]
  protocols: string[]
}

export const batchReshareWithServer = async (input: Input) =>
  queryUrl(`${fastVaultServerUrl}/batch/reshare`, {
    body: input,
    responseType: 'none',
  })
