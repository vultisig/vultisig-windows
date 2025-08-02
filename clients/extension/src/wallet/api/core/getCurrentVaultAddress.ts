import { Chain } from '@core/chain/Chain'
import { deriveAddress } from '@core/chain/publicKey/address/deriveAddress'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { getVaultId } from '@core/ui/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { getWalletCore } from '../../../background/walletCore'
import { storage } from '../../../storage'

export const getCurrentVaultAddress = async (chain: Chain) => {
  const currentVaultId = shouldBePresent(await storage.getCurrentVaultId())

  const walletCore = await getWalletCore()
  const vaults = await storage.getVaults()
  const vault = shouldBePresent(
    vaults.find(vault => getVaultId(vault) === currentVaultId)
  )

  const publicKey = getPublicKey({
    chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
  })

  return deriveAddress({
    chain,
    publicKey,
    walletCore,
  })
}
