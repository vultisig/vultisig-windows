import { yieldBearingAssetsReceiptDenoms } from './config'

export const yieldBearingThorChainTokens = {
  [yieldBearingAssetsReceiptDenoms.yRUNE]: {
    ticker: 'yRUNE',
    logo: 'yrune.png',
    decimals: 8,
    priceProviderId: 'thorchain',
  },
  [yieldBearingAssetsReceiptDenoms.yTCY]: {
    ticker: 'yTCY',
    logo: 'ytcy.png',
    decimals: 8,
    priceProviderId: 'tcy',
  },
} as const
