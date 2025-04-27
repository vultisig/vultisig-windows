import { PublicKeys } from '@core/chain/publicKey/PublicKeys'
import { SignatureAlgorithm } from '@core/chain/signing/SignatureAlgorithm'
import { MpcLib } from '@core/mpc/mpcLib'

export type Vault = {
  name: string
  publicKeys: PublicKeys
  signers: string[]
  createdAt?: number
  hexChainCode: string
  keyShares: Record<SignatureAlgorithm, string>
  localPartyId: string
  // should only be present in legacy GG20 vaults
  resharePrefix?: string
  libType: MpcLib
  isBackedUp: boolean
  order: number
  folderId?: string
}

export const getVaultId = (vault: Vault): string => vault.publicKeys.ecdsa
