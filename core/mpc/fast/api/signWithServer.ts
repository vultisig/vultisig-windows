import { queryUrl } from '@lib/utils/query/queryUrl'

import { fastVaultServerUrl } from '../config'

type Input = {
  public_key: string
  messages: string[]
  session: string
  hex_encryption_key: string
  derive_path: string
  is_ecdsa: boolean
  vault_password: string
  chain: string
}

export const signWithServer = async (input: Input) =>
  queryUrl(`${fastVaultServerUrl}/sign`, {
    body: input,
    responseType: 'none',
  })
