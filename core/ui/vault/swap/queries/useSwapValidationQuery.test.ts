import { Chain } from '@vultisig/core-chain/Chain'
import { isValidAddress } from '@vultisig/core-chain/utils/isValidAddress'
import { describe, expect, it, vi } from 'vitest'

import {
  getImmediateSwapValidationError,
  getSwapBalanceValidationError,
  getSwapQuoteExpiryValidationError,
} from './useSwapValidationQuery'

vi.mock('@vultisig/core-chain/utils/isValidAddress', () => ({
  isValidAddress: vi.fn(),
}))

vi.mock('i18next', () => ({
  t: (key: string, values?: { chain?: string }) =>
    values?.chain ? `${key}:${values.chain}` : key,
}))

const ethCoin = {
  chain: Chain.Ethereum,
} as Parameters<typeof getImmediateSwapValidationError>[0]['fromCoinKey']

const thorCoin = {
  chain: Chain.THORChain,
} as Parameters<typeof getImmediateSwapValidationError>[0]['toCoinKey']

describe('getSwapBalanceValidationError', () => {
  it.each([null, undefined, 0n, -1n])(
    'requires a positive amount for %s',
    amount => {
      expect(getSwapBalanceValidationError({ amount, balance: 10n })).toBe(
        'amount_required'
      )
    }
  )

  it('blocks swaps larger than the available balance', () => {
    expect(getSwapBalanceValidationError({ amount: 11n, balance: 10n })).toBe(
      'swap_insufficient_funds'
    )
  })

  it('allows positive amounts within the available balance', () => {
    expect(getSwapBalanceValidationError({ amount: 10n, balance: 10n })).toBe(
      null
    )
  })
})

describe('getImmediateSwapValidationError', () => {
  it('blocks swapping an asset into itself', () => {
    expect(
      getImmediateSwapValidationError({
        fromCoinKey: ethCoin,
        toCoinKey: ethCoin,
        externalRecipient: '',
        walletCore: {} as never,
      })
    ).toBe('swap_same_asset')
  })

  it('blocks invalid external recipients for the destination chain', () => {
    vi.mocked(isValidAddress).mockReturnValue(false)

    expect(
      getImmediateSwapValidationError({
        fromCoinKey: ethCoin,
        toCoinKey: thorCoin,
        externalRecipient: ' thor_bad ',
        walletCore: {} as never,
      })
    ).toBe('swap_invalid_external_recipient:THORChain')
    expect(isValidAddress).toHaveBeenCalledWith({
      chain: Chain.THORChain,
      address: 'thor_bad',
      walletCore: {},
    })
  })

  it('allows empty external recipients and valid destination addresses', () => {
    expect(
      getImmediateSwapValidationError({
        fromCoinKey: ethCoin,
        toCoinKey: thorCoin,
        externalRecipient: '',
        walletCore: {} as never,
      })
    ).toBe(null)

    vi.mocked(isValidAddress).mockReturnValue(true)
    expect(
      getImmediateSwapValidationError({
        fromCoinKey: ethCoin,
        toCoinKey: thorCoin,
        externalRecipient: 'thor1valid',
        walletCore: {} as never,
      })
    ).toBe(null)
  })
})

describe('getSwapQuoteExpiryValidationError', () => {
  const quoteExpiringAt = (expiresAt: number) =>
    ({ expiresAt }) as Parameters<typeof getSwapQuoteExpiryValidationError>[0]

  it('accepts a quote that is still valid', () => {
    expect(
      getSwapQuoteExpiryValidationError(quoteExpiringAt(1_500), 1_000)
    ).toBeNull()
  })

  it('rejects a quote whose expiry has passed', () => {
    expect(getSwapQuoteExpiryValidationError(quoteExpiringAt(500), 1_000)).toBe(
      'swap_quote_expired'
    )
  })

  it('rejects a quote expiring exactly now, since it can no longer be signed in time', () => {
    expect(
      getSwapQuoteExpiryValidationError(quoteExpiringAt(1_000), 1_000)
    ).toBe('swap_quote_expired')
  })
})
