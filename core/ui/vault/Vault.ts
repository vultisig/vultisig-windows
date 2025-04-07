import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { MpcLib } from '@core/mpc/mpcLib'

export type Vault = {
  name: string
  publicKeys: Record<SignatureAlgorithm, string>
  signers: string[]
  createdAt?: number
  hexChainCode: string
  keyShares: Record<SignatureAlgorithm, string>
  localPartyId: string
  resharePrefix: string
  libType: MpcLib
  isBackedUp: boolean
  order: number
  folderId?: string
}

export const getVaultId = (vault: Vault): string => vault.publicKeys.ecdsa
