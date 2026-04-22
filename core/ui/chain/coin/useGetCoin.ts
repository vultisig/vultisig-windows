import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import {
  areEqualCoins,
  Coin,
  CoinKey,
  coinKeyToString,
} from '@vultisig/core-chain/coin/Coin'
import { knownTokens } from '@vultisig/core-chain/coin/knownTokens'
import { thorchainNativeTokensMetadata } from '@vultisig/core-chain/coin/knownTokens/thorchain'
import { getTokenMetadata } from '@vultisig/core-chain/coin/token/metadata'
import { chainsWithTokenMetadataDiscovery } from '@vultisig/core-chain/coin/token/metadata/chains'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { useCallback } from 'react'

/**
 * Async coin resolver that walks every available metadata source in order:
 * `chainFeeCoin` (when no token id is supplied), `knownTokens`, the THORChain
 * native map, the current vault's coins, and finally on-chain metadata
 * discovery (RPC) for chains that support it. Throws if none produce a result.
 */
export const useGetCoin = () => {
  const coins = useCurrentVaultCoins()

  return useCallback(
    async (coinKey: CoinKey): Promise<Coin> => {
      const { id, chain } = coinKey

      if (!id) {
        return chainFeeCoin[chain]
      }

      const knownToken = knownTokens[chain].find(token =>
        areEqualCoins(token, coinKey)
      )

      if (knownToken) {
        return knownToken
      }

      if (chain === Chain.THORChain) {
        const token = thorchainNativeTokensMetadata[id.toLowerCase()]
        if (token) {
          return {
            ...coinKey,
            ...token,
          }
        }
      }

      const existingCoin = coins.find(coin => areEqualCoins(coin, coinKey))

      if (existingCoin) {
        return existingCoin
      }

      if (isOneOf(chain, chainsWithTokenMetadataDiscovery)) {
        const metadata = await getTokenMetadata({ id, chain })
        return {
          ...coinKey,
          ...metadata,
        }
      }

      throw new Error(
        `Failed to get coin info for coinKey: ${coinKeyToString(coinKey)}`
      )
    },
    [coins]
  )
}
