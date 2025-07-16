import { queryUrl } from '@lib/utils/query/queryUrl'

import { fastVaultServerUrl } from '../config'

type Input = {
  public_key: string
  session_id: string
  hex_encryption_key: string
  encryption_password: string
  email: string
}

export const migrateWithServer = async (input: Input) =>
  queryUrl(`${fastVaultServerUrl}/migrate`, {
    body: input,
    responseType: 'none',
  })
