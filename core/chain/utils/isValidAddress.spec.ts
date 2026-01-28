import { Chain } from '@core/chain/Chain'
import { getCoinType } from '@core/chain/coin/coinType'
import { describe, expect, it, vi } from 'vitest'

import { isValidAddress } from './isValidAddress'

vi.mock('@core/chain/coin/coinType', () => ({
  getCoinType: vi.fn(() => 931), // dummy coin type
}))

const makeWalletCore = (overrides: Record<string, unknown> = {}) => ({
  AnyAddress: {
    isValid: vi.fn().mockReturnValue(false),
    isValidBech32: vi.fn().mockReturnValue(false),
  },
  ...overrides,
})

describe('isValidAddress', () => {
  it('accepts Maya valoper addresses', () => {
    const mayaAddress = 'mayavaloper1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9h0l2'
    const walletCore = makeWalletCore({
      AnyAddress: {
        isValid: vi.fn().mockReturnValue(false),
        isValidBech32: vi
          .fn()
          .mockImplementation((_addr, _coin, hrp) => hrp === 'mayavaloper'),
      },
    })

    const result = isValidAddress({
      chain: Chain.MayaChain,
      address: mayaAddress,
      walletCore: walletCore as any,
    })

    expect(getCoinType).toHaveBeenCalled()
    expect(walletCore.AnyAddress.isValidBech32).toHaveBeenCalledWith(
      mayaAddress,
      expect.anything(),
      'mayavaloper'
    )
    expect(result).toBe(true)
  })
})
