import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { tcyAutoCompounderConfig } from '@vultisig/core-chain/chains/cosmos/thor/tcy-autocompound/config'
import { coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { thorchainTokens } from '../../tokens'
import { fetchStcyStakePosition } from './stcyStakeService'

vi.mock('@vultisig/lib-utils/query/queryUrl', () => ({
  queryUrl: vi.fn(),
}))

const address = 'thor1holder'
const bankApiBase = `${cosmosRpcUrl.THORChain}/cosmos/bank/v1beta1`
const userBalanceUrl = `${bankApiBase}/balances/${address}/by_denom?denom=${encodeURIComponent(tcyAutoCompounderConfig.shareDenom)}`
const vaultBalanceUrl = `${bankApiBase}/balances/${tcyAutoCompounderConfig.contract}/by_denom?denom=${encodeURIComponent(tcyAutoCompounderConfig.depositDenom)}`
const supplyUrl = `${bankApiBase}/supply/by_denom?denom=${encodeURIComponent(tcyAutoCompounderConfig.shareDenom)}`
const tcyPriceKey = coinKeyToString(thorchainTokens.tcy)
const stcyPriceKey = coinKeyToString(thorchainTokens.stcy)

const mockBalances = ({
  shares = '116484502',
  vaultBalance = '830427161000000',
  shareSupply = '737370434000000',
}: {
  shares?: string
  vaultBalance?: string
  shareSupply?: string
} = {}) => {
  vi.mocked(queryUrl).mockImplementation(url => {
    if (url === userBalanceUrl) {
      return Promise.resolve({ balance: { amount: shares } })
    }
    if (url === vaultBalanceUrl) {
      return Promise.resolve({ balance: { amount: vaultBalance } })
    }
    if (url === supplyUrl) {
      return Promise.resolve({ amount: { amount: shareSupply } })
    }

    return Promise.reject(new Error(`Unexpected query: ${url}`))
  })
}

const fetchPosition = () =>
  fetchStcyStakePosition({
    address,
    prices: {
      [tcyPriceKey]: 0.13977412,
      [stcyPriceKey]: 999,
    },
  })

describe('fetchStcyStakePosition', () => {
  beforeEach(() => {
    vi.mocked(queryUrl).mockReset()
  })

  it('values sTCY shares by their live underlying TCY without changing the share amount', async () => {
    mockBalances()

    const position = await fetchPosition()

    expect(position?.amount).toBe(116484502n)
    expect(position?.fiatValue).toBeCloseTo(0.183362591, 9)
    expect(queryUrl).toHaveBeenCalledWith(vaultBalanceUrl)
    expect(queryUrl).toHaveBeenCalledWith(supplyUrl)
  })

  it('returns zero fiat for a zero supply instead of dividing by zero or valuing shares 1:1', async () => {
    mockBalances({ shareSupply: '0' })

    const position = await fetchPosition()

    expect(position?.amount).toBe(116484502n)
    expect(position?.fiatValue).toBe(0)
  })

  it('keeps the share position visible when a redemption-rate query fails', async () => {
    mockBalances()
    vi.mocked(queryUrl).mockImplementation(url => {
      if (url === userBalanceUrl) {
        return Promise.resolve({ balance: { amount: '116484502' } })
      }

      return Promise.reject(new Error('THORChain RPC unavailable'))
    })

    const position = await fetchPosition()

    expect(position?.amount).toBe(116484502n)
    expect(position?.fiatValue).toBe(0)
  })

  it('skips redemption-rate queries for an empty share balance', async () => {
    mockBalances({ shares: '0' })

    const position = await fetchPosition()

    expect(position?.amount).toBe(0n)
    expect(position?.fiatValue).toBe(0)
    expect(queryUrl).toHaveBeenCalledTimes(1)
  })

  it('returns null when the user share balance cannot be read', async () => {
    vi.mocked(queryUrl).mockRejectedValue(
      new Error('THORChain RPC unavailable')
    )

    await expect(fetchPosition()).resolves.toBeNull()
  })
})
