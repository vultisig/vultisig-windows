import { match } from '@vultisig/lib-utils/match'

export type SlippageMode = 'auto' | '0.5' | '1' | '3' | 'custom'

export type SlippageValue = {
  mode: SlippageMode
  customPercent: number
}

export const defaultSlippage: SlippageValue = {
  mode: 'auto',
  customPercent: 0,
}

// Sanity cap for a manually entered slippage tolerance (percent).
const maxSlippagePercent = 50

/**
 * Normalizes a typed custom slippage into the text the field should show and
 * the percent it means, capped at the max. A comma is read as the decimal
 * point, so `0,5` is 0.5% rather than an unparseable value that would
 * silently fall back to Auto (#5289). Returns `undefined` for a rejected edit
 * (a second separator or any other character) so the field keeps what it had
 * and never fills with junk like `0,,,,`.
 */
export const parseCustomSlippageInput = (raw: string) => {
  const text = raw.replace(/,/g, '.')
  const padded = text.startsWith('.') ? `0${text}` : text

  if (!/^\d*\.?\d*$/.test(padded)) {
    return undefined
  }

  return {
    text: padded,
    percent: Math.min(Number(padded), maxSlippagePercent),
  }
}

/**
 * Human-readable label for the current slippage selection, shown on the
 * Advanced swap settings row (e.g. `Auto`, `0.5%`, `2%`).
 */
export const formatSlippage = (
  { mode, customPercent }: SlippageValue,
  autoLabel: string
): string =>
  match(mode, {
    auto: () => autoLabel,
    '0.5': () => '0.5%',
    '1': () => '1%',
    '3': () => '3%',
    // A non-positive custom value is treated as "no override" (Auto) by
    // slippageToPercent, so display it the same way to keep the row and the
    // quote input in sync.
    custom: () => (customPercent > 0 ? `${customPercent}%` : autoLabel),
  })

/**
 * Slippage tolerance as a percent for the swap quote (e.g. `0.5` = 0.5%), or
 * `undefined` for `Auto` so the SDK keeps each provider's default.
 */
export const slippageToPercent = ({
  mode,
  customPercent,
}: SlippageValue): number | undefined =>
  match(mode, {
    auto: () => undefined,
    '0.5': () => 0.5,
    '1': () => 1,
    '3': () => 3,
    custom: () => (customPercent > 0 ? customPercent : undefined),
  })
