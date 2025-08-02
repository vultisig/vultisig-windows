import { yieldBearingAssetsReceiptDenoms } from './config'

export const yieldBearingThorChainTokens = {
  [yieldBearingAssetsReceiptDenoms.yRUNE]: {
    ticker: 'yRUNE',
    logo: 'ruji',
    decimals: 8,
    priceProviderId: 'thorchain',
  },
  [yieldBearingAssetsReceiptDenoms.yTCY]: {
    ticker: 'yTCY',
    logo: 'tcy.png',
    decimals: 8,
    priceProviderId: 'tcy',
  },
} as const
