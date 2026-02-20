import { assetAliases, resolveAsset } from '../shared/assetResolution'
import type { ToolHandler } from '../types'

export const handleAssetLookup: ToolHandler = async input => {
  const assetStr = String(input.asset ?? '').trim()
  if (!assetStr) throw new Error('asset is required')

  const asset = resolveAsset(assetStr)

  if (!asset) {
    const availableAssets = Object.keys(assetAliases)
    return {
      data: {
        found: false,
        input: assetStr,
        message: `Asset '${assetStr}' not found in known aliases`,
        available_assets: availableAssets,
        ui: {
          title: 'Asset Lookup',
          summary: `No asset found for ${assetStr}`,
        },
      },
    }
  }

  return {
    data: {
      found: true,
      input: assetStr,
      chain: asset.chain,
      ticker: asset.ticker,
      token_address: asset.tokenAddress,
      is_native: asset.isNative,
      decimals: asset.decimals,
      logo: asset.logo,
      price_provider_id: asset.priceProviderId,
      ui: {
        title: 'Asset Lookup',
        summary: `${assetStr} resolves to ${asset.ticker} on ${asset.chain}`,
        actions: [{ type: 'copy', label: 'Copy Ticker', value: asset.ticker }],
      },
    },
  }
}
