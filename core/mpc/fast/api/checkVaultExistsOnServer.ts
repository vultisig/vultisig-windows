import { fastVaultServerUrl } from '../config'

/** Checks whether a vault with the given ECDSA public key exists on the VultiServer. */
export const checkVaultExistsOnServer = async (
  publicKeyECDSA: string
): Promise<boolean> => {
  const response = await fetch(`${fastVaultServerUrl}/exist/${publicKeyECDSA}`)
  return response.status === 200
}
