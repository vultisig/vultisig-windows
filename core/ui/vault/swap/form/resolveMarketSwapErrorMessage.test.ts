import { SwapError, SwapErrorCode } from '@vultisig/core-chain/swap/SwapError'
import { describe, expect, it, vi } from 'vitest'

import { resolveMarketSwapErrorMessage } from './resolveMarketSwapErrorMessage'

describe('resolveMarketSwapErrorMessage', () => {
  it.each([
    [SwapErrorCode.AllProvidersFailed, 'swap_all_providers_failed'],
    [SwapErrorCode.AmountBelowMinimum, 'swap_amount_below_minimum'],
    [SwapErrorCode.AmountTooSmall, 'swap_amount_too_small'],
    [SwapErrorCode.InvalidConfig, 'swap_invalid_config'],
    [SwapErrorCode.NoRoutesFound, 'swap_no_routes_found'],
    [SwapErrorCode.TradingHalted, 'swap_trading_halted'],
  ])('maps %s to %s', (code, expectedKey) => {
    const translate = vi.fn((key: string) => `translated:${key}`)

    expect(
      resolveMarketSwapErrorMessage({
        error: new SwapError(code, 'raw SDK error'),
        translate,
      })
    ).toBe(`translated:${expectedKey}`)
    expect(translate).toHaveBeenCalledWith(expectedKey)
  })

  it('preserves the existing fallback for untyped errors', () => {
    const translate = vi.fn()

    expect(
      resolveMarketSwapErrorMessage({
        error: new Error('untyped failure'),
        translate,
      })
    ).toBe('untyped failure')
    expect(translate).not.toHaveBeenCalled()
  })

  it('maps a known SDK code across module or serialization boundaries', () => {
    const translate = vi.fn((key: string) => `translated:${key}`)

    expect(
      resolveMarketSwapErrorMessage({
        error: {
          code: SwapErrorCode.AllProvidersFailed,
          message: 'provider failure from another module instance',
        },
        translate,
      })
    ).toBe('translated:swap_all_providers_failed')
  })

  it('does not treat an unknown error code as a swap error', () => {
    const translate = vi.fn()

    expect(
      resolveMarketSwapErrorMessage({
        error: { code: 'UNKNOWN', message: 'unknown failure' },
        translate,
      })
    ).toBe('unknown failure')
    expect(translate).not.toHaveBeenCalled()
  })
})
