import { Coin } from '@vultisig/core-chain/coin/Coin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'

const fractionPattern = /^(.*?)\.(\d+)(.*)$/

/**
 * Every way to show `amount` with its ticker, longest first. Each next one
 * drops a fraction digit — cut, never rounded, so the figure is never higher
 * than the real one — and the list stops before a non-zero amount would read
 * as zero.
 */
export const getAmountCandidates = (amount: number, coin: Coin) => {
  const full = formatAmount(amount, coin)
  const ticker = ` ${coin.ticker}`
  const formatted = full.slice(0, full.length - ticker.length)

  const match = fractionPattern.exec(formatted)
  if (!match) return [full]

  const [, whole, fraction, suffix] = match
  const hasValue = (text: string) => /[1-9]/.test(text)

  const candidates: string[] = []
  for (let kept = fraction.length; kept >= 0; kept--) {
    const digits = fraction.slice(0, kept).replace(/0+$/, '')
    if (hasValue(formatted) && !hasValue(whole + digits)) break

    const number = digits ? `${whole}.${digits}${suffix}` : `${whole}${suffix}`
    const candidate = `${number}${ticker}`
    if (candidates[candidates.length - 1] !== candidate)
      candidates.push(candidate)
  }

  return candidates.length > 0 ? candidates : [full]
}
