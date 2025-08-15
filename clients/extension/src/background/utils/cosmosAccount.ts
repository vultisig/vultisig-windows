import { getWalletCore } from '@clients/extension/src/background/walletCore'
import { Chain } from '@core/chain/Chain'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { storage } from '@core/extension/storage'
import { getVaultId } from '@core/ui/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { hexToBytes } from '@lib/utils/hexToBytes'

import { CosmosAccount } from '../../utils/interfaces'

export const generateCosmosAccount = async (
  responseAddress: string,
  chain: Chain
): Promise<CosmosAccount[] | undefined> => {
  try {
    const currentVaultId = await storage.getCurrentVaultId()

    const vaults = await storage.getVaults()
    const currentVault = shouldBePresent(
      vaults.find(vault => getVaultId(vault) === currentVaultId)
    )

    const walletCore = await getWalletCore()
    if (!walletCore) throw new Error('WalletCore is not initialized!')

    const publicKey = getPublicKey({
      chain,
      walletCore,
      hexChainCode: currentVault.hexChainCode,
      publicKeys: currentVault.publicKeys,
    })

    const keyBytes = hexToBytes(Buffer.from(publicKey.data()).toString('hex'))

    return [
      {
        pubkey: Array.from(keyBytes),
        address: responseAddress,
        algo: 'secp256k1',
        bech32Address: responseAddress,
        isKeystone: false,
        isNanoLedger: false,
      },
    ]
  } catch (error) {
    console.error('[generateCosmosAccount] Error:', error)
    throw error
  }
}
