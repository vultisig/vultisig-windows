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
    custom: () => `${customPercent}%`,
  })
