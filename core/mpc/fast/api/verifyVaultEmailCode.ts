import { queryUrl } from '@lib/utils/query/queryUrl'

import { fastVaultServerUrl } from '../config'

type VerifyVaultEmailCodeInput = {
  vaultId: string
  code: string
}

export const verifyVaultEmailCode = async ({
  vaultId,
  code,
}: VerifyVaultEmailCodeInput) =>
  queryUrl(`${fastVaultServerUrl}/verify/${vaultId}/${code}`, {
    responseType: 'none',
  })
