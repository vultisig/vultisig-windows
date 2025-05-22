import { getWalletCore } from '@clients/extension/src/background/walletCore'
import { getCurrentVaultId } from '@clients/extension/src/vault/state/currentVaultId'
import { getVaults } from '@clients/extension/src/vault/state/vaults'
import { Chain } from '@core/chain/Chain'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { toHexPublicKey } from '@core/chain/utils/toHexPublicKey'
import { getVaultId } from '@core/ui/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { hexToBytes } from '@lib/utils/hexToBytes'

interface CosmosAccount {
  pubkey: number[]
  address: string
  algo: 'secp256k1'
  bech32Address: string
  isKeystone: boolean
  isNanoLedger: boolean
}

export const generateCosmosAccount = async (
  responseAddress: string,
  chain: Chain
): Promise<CosmosAccount[] | undefined> => {
  try {
    const currentVaultId = await getCurrentVaultId()

    const vaults = await getVaults()
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

    const keyBytes = hexToBytes(toHexPublicKey({ publicKey, walletCore }))

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
