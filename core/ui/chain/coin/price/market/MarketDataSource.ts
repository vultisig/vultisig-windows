import { Chain, EvmChain } from '@vultisig/core-chain/Chain'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { chainPrefixToChain } from '@vultisig/core-chain/chains/cosmos/thor/lp/lpChainMap'
import { yieldBearingThorChainTokens } from '@vultisig/core-chain/chains/cosmos/thor/yield-bearing-tokens/yAssetsOnThorChain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { areLowerCaseEqual } from '@vultisig/lib-utils/string/areLowerCaseEqual'

import { mayaPoolPricedTokens } from '../maya/mayaPoolPricedTokens'
import { isThorchainSecuredAssetDenom } from '../thor/getThorchainSecuredAssetPrices'

/**
 * How a coin's market data (chart, stats) is looked up on CoinGecko: by
 * coin id, or by asset-platform + contract address for tokens without an id.
 */
export type MarketDataSource =
  | { id: string }
  | { contract: { platform: string; address: string } }

/**
 * CoinGecko asset-platform slugs for contract-based lookups. Mirrors the
 * network mapping used by `getErc20Prices` in `@vultisig/core-chain`, which
 * does not export it.
 */
const coinGeckoPlatform: Record<EvmChain, string> = {
  [EvmChain.Ethereum]: 'ethereum',
  [EvmChain.Avalanche]: 'avalanche',
  [EvmChain.Base]: 'base',
  [EvmChain.Blast]: 'blast',
  [EvmChain.Arbitrum]: 'arbitrum-one',
  [EvmChain.Polygon]: 'polygon-pos',
  [EvmChain.Optimism]: 'optimistic-ethereum',
  [EvmChain.BSC]: 'binance-smart-chain',
  [EvmChain.Zksync]: 'zksync',
  [EvmChain.CronosChain]: 'cronos',
  [EvmChain.Mantle]: 'mantle',
  [EvmChain.Hyperliquid]: 'hyperliquid',
  [EvmChain.Sei]: 'sei-network',
  [EvmChain.Robinhood]: 'robinhood',
}

/**
 * Charts a THORChain secured asset as its underlying asset: `btc-btc`
 * becomes Bitcoin's id lookup, `eth-usdc-0x…` becomes an Ethereum contract
 * lookup. The asset is priced via THORChain's pool oracle, but its market
 * history is the underlying coin's.
 */
const getSecuredAssetMarketDataSource = (
  denom: string
): MarketDataSource | null => {
  const [chainPrefix, ticker, contract] = denom.split('-')
  if (!ticker) return null

  const chain = chainPrefixToChain(chainPrefix)
  if (!chain) return null

  if (contract) {
    return isChainOfKind(chain, 'evm')
      ? {
          contract: {
            platform: coinGeckoPlatform[chain],
            address: contract.toLowerCase(),
          },
        }
      : null
  }

  const feeCoin = chainFeeCoin[chain]

  return feeCoin.priceProviderId && areLowerCaseEqual(feeCoin.ticker, ticker)
    ? { id: feeCoin.priceProviderId.toLowerCase() }
    : null
}

type ResolveMarketDataSourceInput = CoinKey & {
  priceProviderId?: string
}

/**
 * Resolves the CoinGecko lookup source for a coin, mirroring the price
 * routing in `useCoinPricesQuery`. THORChain secured assets chart as their
 * underlying asset. Returns `null` for pool-priced tokens without an
 * underlying CoinGecko identity (Maya pool assets, THORChain yield-bearing
 * assets) — callers hide the chart and stats sections for those instead of
 * falling back to another provider.
 *
 * The id and contract address are lowercased here so every spelling of the
 * same coin shares one query-cache entry, and because `/coins/{id}` lookups
 * are case-sensitive upstream (`/coins/Bitcoin` 404s).
 */
export const resolveMarketDataSource = ({
  chain,
  id,
  priceProviderId,
}: ResolveMarketDataSourceInput): MarketDataSource | null => {
  if (
    chain === Chain.MayaChain &&
    id &&
    id.toLowerCase() in mayaPoolPricedTokens
  ) {
    return null
  }

  if (priceProviderId) {
    return { id: priceProviderId.toLowerCase() }
  }

  if (
    id &&
    id in yieldBearingThorChainTokens &&
    isChainOfKind(chain, 'cosmos')
  ) {
    return null
  }

  if (chain === Chain.THORChain && id && isThorchainSecuredAssetDenom(id)) {
    return getSecuredAssetMarketDataSource(id)
  }

  if (isChainOfKind(chain, 'evm') && id) {
    return {
      contract: {
        platform: coinGeckoPlatform[chain],
        address: id.toLowerCase(),
      },
    }
  }

  return null
}
