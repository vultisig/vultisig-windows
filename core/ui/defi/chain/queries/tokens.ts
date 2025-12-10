import { Chain } from '@core/chain/Chain'
import { yieldBearingThorChainTokens } from '@core/chain/chains/cosmos/thor/yield-bearing-tokens/yAssetsOnThorChain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'
import { knownCosmosTokens } from '@core/chain/coin/knownTokens/cosmos'

export const runeCoin: Coin = {
  ...chainFeeCoin[Chain.THORChain],
  chain: Chain.THORChain,
}

export const thorchainTokens: Record<string, Coin> = {
  tcy: {
    ...knownCosmosTokens[Chain.THORChain]['tcy'],
    chain: Chain.THORChain,
    id: 'tcy',
  },
  stcy: {
    ...knownCosmosTokens[Chain.THORChain]['x/staking-tcy'],
    chain: Chain.THORChain,
    id: 'x/staking-tcy',
    ticker: 'sTCY',
  },
  ruji: {
    ...knownCosmosTokens[Chain.THORChain]['x/ruji'],
    chain: Chain.THORChain,
    id: 'x/ruji',
    ticker: 'RUJI',
  },
  yRune: {
    ...yieldBearingThorChainTokens[
      'x/nami-index-nav-thor1mlphkryw5g54yfkrp6xpqzlpv4f8wh6hyw27yyg4z2els8a9gxpqhfhekt-rcpt'
    ],
    chain: Chain.THORChain,
    id: 'x/nami-index-nav-thor1mlphkryw5g54yfkrp6xpqzlpv4f8wh6hyw27yyg4z2els8a9gxpqhfhekt-rcpt',
  },
  yTcy: {
    ...yieldBearingThorChainTokens[
      'x/nami-index-nav-thor1h0hr0rm3dawkedh44hlrmgvya6plsryehcr46yda2vj0wfwgq5xqrs86px-rcpt'
    ],
    chain: Chain.THORChain,
    id: 'x/nami-index-nav-thor1h0hr0rm3dawkedh44hlrmgvya6plsryehcr46yda2vj0wfwgq5xqrs86px-rcpt',
  },
}

export const thorchainDefiCoins: Coin[] = [
  runeCoin,
  thorchainTokens.tcy,
  thorchainTokens.stcy,
  thorchainTokens.ruji,
  thorchainTokens.yRune,
  thorchainTokens.yTcy,
]
