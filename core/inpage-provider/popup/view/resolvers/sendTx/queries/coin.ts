import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import {
  areEqualCoins,
  Coin,
  CoinKey,
  coinKeyToString,
} from '@core/chain/coin/Coin'
import { knownTokens } from '@core/chain/coin/knownTokens'
import { thorchainNativeTokensMetadata } from '@core/chain/coin/knownTokens/thorchain'
import { getTokenMetadata } from '@core/chain/coin/token/metadata'
import { chainsWithTokenMetadataDiscovery } from '@core/chain/coin/token/metadata/chains'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { UseQueryOptions } from '@tanstack/react-query'
import { useCallback } from 'react'

type CoinQueryKey = readonly ['coin', CoinKey]

export const useGetCoinQuery = () => {
  const coins = useCurrentVaultCoins()

  return useCallback(
    (coinKey: CoinKey): UseQueryOptions<Coin, Error, Coin, CoinQueryKey> => ({
      queryKey: ['coin', coinKey],
      queryFn: async (): Promise<Coin> => {
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
      retry: false,
      retryOnMount: false,
    }),
    [coins]
  )
}
