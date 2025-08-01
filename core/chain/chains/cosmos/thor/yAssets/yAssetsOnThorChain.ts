import { yAssetReceiptDenoms, yAssets } from './config'

export const yAssetsOnThorChain = Object.fromEntries(
  yAssets.map(asset => [
    yAssetReceiptDenoms[asset],
    {
      ticker: asset,
      logo: asset === 'yRUNE' ? 'ruji' : 'tcy.png',
      decimals: 8,
      priceProviderId: asset === 'yRUNE' ? 'thorchain' : 'tcy',
    },
  ])
)
