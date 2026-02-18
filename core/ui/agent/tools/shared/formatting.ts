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
  if (!pricing || pricing.length === 0) return ''

  const parts: string[] = []
  for (const p of pricing) {
    const asset = (p.asset || 'USDC').toUpperCase()
    const decimals = pricingAssetDecimals(asset)
    let humanAmount = p.amount
    for (let i = 0; i < decimals; i++) {
      humanAmount /= 10
    }

    if (humanAmount === 0) continue

    let amountStr = `$${humanAmount.toFixed(2)}`
    amountStr = amountStr.replace(/\.?0+$/, '')

    switch (p.type) {
      case 'per-tx':
        parts.push(`${amountStr} ${asset} per transaction`)
        break
      case 'once':
        parts.push(`${amountStr} ${asset} one-time`)
        break
      case 'recurring': {
        const freq = p.frequency || 'monthly'
        parts.push(`${amountStr} ${asset} ${freq}`)
        break
      }
      default:
        parts.push(`${amountStr} ${asset}`)
    }
  }

  return parts.join(', ')
}

export type { AppPricing }
