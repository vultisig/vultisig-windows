import { queryUrl } from '@lib/utils/query/queryUrl'

import { fastVaultServerUrl } from '../config'

type ResendVaultShareInput = {
  public_key_ecdsa: string
  email: string
  password: string
}

export const resendVaultShare = async (input: ResendVaultShareInput) =>
  queryUrl(`${fastVaultServerUrl}/resend`, {
    body: input,
    responseType: 'none',
  })
