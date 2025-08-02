import { getVaultPublicKeyExport } from '@core/ui/vault/share/utils/getVaultPublicKeyExport'
import { getVaultId } from '@core/ui/vault/Vault'

import { storage } from '../../../storage'
import { BackgroundApiResolver } from '../resolver'

export const getVault: BackgroundApiResolver<'getVault'> = async () => {
  const vaults = await storage.getVaults()
  const currentVaultId = await storage.getCurrentVaultId()

  if (!currentVaultId) {
    throw new Error('No vault selected')
  }

  const currentVault = vaults.find(
    vault => getVaultId(vault) === currentVaultId
  )
  if (!currentVault) {
    throw new Error(`Selected vault not found`)
  }

  const { uid, hex_chain_code, name, public_key_ecdsa, public_key_eddsa } =
    getVaultPublicKeyExport(currentVault)

  return {
    name,
    uid,
    hexChainCode: hex_chain_code,
    publicKeyEcdsa: public_key_ecdsa,
    publicKeyEddsa: public_key_eddsa,
  }
}
