import { Vault } from '@core/ui/vault/Vault'
import { createHash } from 'crypto'

type VaultPublicKeyExport = {
  uid: string
  name: string
  public_key_ecdsa: string
  public_key_eddsa: string
  hex_chain_code: string
}

export const getVaultPublicKeyExport = ({
  name,
  publicKeys,
  hexChainCode,
}: Vault): VaultPublicKeyExport => {
  const uid = createHash('sha256')
    .update([name, publicKeys.ecdsa, publicKeys.eddsa, hexChainCode].join('-'))
    .digest('hex')

  return {
    uid,
    name: name,
    public_key_ecdsa: publicKeys.ecdsa,
    public_key_eddsa: publicKeys.eddsa,
    hex_chain_code: hexChainCode,
  }
}
