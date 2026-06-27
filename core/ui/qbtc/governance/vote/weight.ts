const decScale = 18n
const decDivisor = 10n ** decScale

/**
 * Converts an integer weight percentage (0–100) into the canonical 18-decimal
 * `cosmos.Dec` string the chain expects for `WeightedVoteOption.weight`
 * (e.g. `70` → `"0.700000000000000000"`). String/bigint math avoids the float
 * rounding a naive `percent / 100` would introduce, and matches iOS byte-for-
 * byte so cross-device cosigning produces identical SignDocs.
 */
export const qbtcWeightPercentToDecString = (percent: number): string => {
  if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
    throw new Error(`QBTC weighted vote: invalid weight percent ${percent}`)
  }
  // percent / 100 with 18 decimals == percent * 10^16, scaled by 10^18.
  const scaled = BigInt(percent) * 10n ** 16n
  const intPart = scaled / decDivisor
  const fracPart = (scaled % decDivisor)
    .toString()
    .padStart(Number(decScale), '0')
  return `${intPart}.${fracPart}`
}
