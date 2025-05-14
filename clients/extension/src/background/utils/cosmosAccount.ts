import { getWalletCore } from '@clients/extension/src/background/walletCore'
import { getVaults } from '@clients/extension/src/vault/state/vaults'
import { getVaultsCoins } from '@clients/extension/src/vault/state/vaultsCoins'
import { Chain } from '@core/chain/Chain'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { toHexPublicKey } from '@core/chain/utils/toHexPublicKey'
import { getVaultId } from '@core/ui/vault/Vault'
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
    const vaults = await getVaults()
    const allCoins = await getVaultsCoins()

    const targetVault = vaults.find(vault => {
      const coins = allCoins[getVaultId(vault)] ?? []
      return coins.some(
        coin =>
          isFeeCoin(coin) &&
          coin.chain === chain &&
          coin.address === responseAddress
      )
    })

    if (!targetVault) throw new Error('Vault not found!')

    const walletCore = await getWalletCore()
    if (!walletCore) throw new Error('WalletCore is not initialized!')

    const publicKey = getPublicKey({
      chain,
      walletCore,
      hexChainCode: targetVault.hexChainCode,
      publicKeys: targetVault.publicKeys,
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
