import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'

import { DefiPosition } from '../../../storage/defiPositions'
import { mayaCoin, runeCoin, thorchainTokens } from '../queries/tokens'

const thorPositionCoinByTicker: Record<string, Coin> = {
  RUNE: runeCoin,
  TCY: thorchainTokens.tcy,
  STCY: thorchainTokens.stcy,
  RUJI: thorchainTokens.ruji,
  YRUNE: thorchainTokens.yRune,
  YTCY: thorchainTokens.yTcy,
}

const mayaPositionCoinByTicker: Record<string, Coin> = {
  CACAO: mayaCoin,
}

export const resolveDefiPositionCoin = (position: DefiPosition): Coin => {
  if (position.coin) return position.coin

  const ticker = position.ticker.toUpperCase()

  if (position.chain === Chain.THORChain && thorPositionCoinByTicker[ticker]) {
    return thorPositionCoinByTicker[ticker]
  }

  if (position.chain === Chain.MayaChain && mayaPositionCoinByTicker[ticker]) {
    return mayaPositionCoinByTicker[ticker]
  }

  const fallbackCoin = chainFeeCoin[position.chain]

  if (fallbackCoin) {
    return {
      ...fallbackCoin,
      ticker: position.ticker,
      chain: position.chain,
    }
  }

  return {
    chain: position.chain,
    ticker: position.ticker,
    decimals: 8,
  }
}

export const resolveDefiPositionIcon = (position: DefiPosition) => {
  const coin = resolveDefiPositionCoin(position)
  if (coin.logo) return getCoinLogoSrc(coin.logo)
  return getChainLogoSrc(position.chain)
}
