import { baseAffiliateBps } from '@core/chain/swap/affiliate/config'

const maxFractionDigits = 2

export const formatDiscountPercentOfBaseFee = (bps: number): string => {
  if (!Number.isFinite(bps) || bps <= 0) {
    return '0%'
  }

  const percent = (bps / baseAffiliateBps) * 100
  const rounded = Number(percent.toFixed(maxFractionDigits))

  return `${rounded}%`
}
