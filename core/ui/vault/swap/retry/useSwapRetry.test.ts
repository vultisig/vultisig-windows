import { Chain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { navigate, useCurrentVaultCoins } = vi.hoisted(() => ({
  navigate: vi.fn(),
  useCurrentVaultCoins: vi.fn(),
}))
vi.mock('../../../navigation/hooks/useCoreNavigate', () => ({
  useCoreNavigate: () => navigate,
}))
vi.mock('../../state/currentVaultCoins', () => ({ useCurrentVaultCoins }))

import { useSwapRetry } from './useSwapRetry'

const eth = { chain: Chain.Ethereum }
const btc = { chain: Chain.Bitcoin }
const usdc = {
  chain: Chain.Ethereum,
  id: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
}

describe('useSwapRetry', () => {
  beforeEach(() => vi.clearAllMocks())

  it('reopens the swap form on the same pair and nothing else', () => {
    useCurrentVaultCoins.mockReturnValue([eth, btc])

    const retry = useSwapRetry({ fromCoin: eth, toCoin: btc, replace: true })
    retry?.()

    expect(navigate).toHaveBeenCalledWith(
      { id: 'swap', state: { fromCoin: eth, toCoin: btc } },
      { replace: true }
    )
  })

  it('offers nothing when either coin has left the vault', () => {
    useCurrentVaultCoins.mockReturnValue([eth, btc])

    expect(useSwapRetry({ fromCoin: usdc, toCoin: btc })).toBeUndefined()
    expect(useSwapRetry({ fromCoin: eth, toCoin: usdc })).toBeUndefined()
  })

  it('offers nothing when the payload never named a destination', () => {
    useCurrentVaultCoins.mockReturnValue([eth, btc])

    expect(useSwapRetry({ fromCoin: eth, toCoin: undefined })).toBeUndefined()
  })
})
