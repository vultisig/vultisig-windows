import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

type AppPricing = {
  id: string
  pluginId: string
  amount: number
  asset: string
  type: string
  frequency: string
  metric: string
}

function pricingAssetDecimals(asset: string): number {
  const upper = asset.toUpperCase()
  for (const fc of Object.values(chainFeeCoin)) {
    if (fc.ticker === upper) return fc.decimals
  }
  return 6
}

export function formatPluginPricing(pricing: AppPricing[]): string {
  if (pricing.length === 0) return ''

  const pricingSuffix: Record<string, string | ((pr: AppPricing) => string)> = {
    'per-tx': 'per transaction',
    once: 'one-time',
    recurring: pr => pr.frequency || 'monthly',
  }

  const parts: string[] = []
  for (const p of pricing) {
    const asset = p.asset.toUpperCase()
    const decimals = pricingAssetDecimals(asset)
    const humanAmount = p.amount / 10 ** decimals

    if (humanAmount === 0) continue

    let amountStr = humanAmount.toFixed(2)
    amountStr = amountStr.replace(/\.?0+$/, '')

    const suffix = pricingSuffix[p.type]
    if (suffix !== undefined) {
      const resolved = typeof suffix === 'function' ? suffix(p) : suffix
      parts.push(`${amountStr} ${asset} ${resolved}`)
    } else {
      parts.push(`${amountStr} ${asset}`)
    }
  }

  return parts.join(', ')
}
