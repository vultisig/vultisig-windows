import { toChainAmount } from '@core/chain/amount/toChainAmount'

type Input = {
  hasReferral: boolean
  referrerBps: number
  fromAmount?: number | null
  fromUsdPrice?: number
  toUsdPrice?: number
  toDecimals: number
}

export const calcReferralDeltaInToAsset = ({
  hasReferral,
  referrerBps,
  fromAmount,
  fromUsdPrice,
  toUsdPrice,
  toDecimals,
}: Input): bigint => {
  if (!hasReferral) return 0n
  if (!fromAmount || !fromUsdPrice || !toUsdPrice) return 0n
  if (referrerBps <= 0) return 0n

  const deltaUsd = (referrerBps / 10_000) * (fromAmount * fromUsdPrice)

  const deltaToUnits = deltaUsd / toUsdPrice
  return toChainAmount(deltaToUnits, toDecimals)
}
