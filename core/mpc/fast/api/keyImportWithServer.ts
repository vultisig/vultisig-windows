import { queryUrl } from '@lib/utils/query/queryUrl'

import { fastVaultServerUrl } from '../config'

type Input = {
  name: string
  session_id: string
  hex_encryption_key: string
  local_party_id: string
  encryption_password: string
  email: string
  lib_type: number
  protocols: string[]
  chains: string[]
}

export const keyImportWithServer = async (input: Input) =>
  queryUrl(`${fastVaultServerUrl}/batch/import`, {
    body: input,
    responseType: 'none',
  })
