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
