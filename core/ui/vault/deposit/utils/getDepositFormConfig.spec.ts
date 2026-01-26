import { Chain } from '@core/chain/Chain'
import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { TFunction } from 'i18next'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getDepositFormConfig } from './getDepositFormConfig'

vi.mock('@core/chain/utils/isValidAddress', () => ({
  isValidAddress: vi.fn(),
}))

const t: TFunction = ((key: string) => key) as TFunction

const tonCoin = {
  chain: Chain.Ton,
  id: 'ton',
  ticker: 'TON',
  decimals: 9,
  address: 'sender',
}

describe('TON stake/unstake validation', () => {
  beforeEach(() => {
    vi.mocked(isValidAddress).mockReset()
    vi.mocked(isValidAddress).mockImplementation(({ address }) =>
      String(address).includes('valid')
    )
  })

  it('rejects stake amount above available balance', () => {
    vi.mocked(isValidAddress).mockReturnValue(true)

    const { schema } = getDepositFormConfig({
      t,
      coin: tonCoin as any,
      walletCore: {} as any,
      totalAmountAvailable: 5,
      selectedChainAction: 'stake',
    })

    const result = schema.safeParse({
      amount: 10,
      validatorAddress: 'EQ123',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(
      'chainFunctions.amountExceeded'
    )
  })

  it('rejects invalid validator address for stake', () => {
    vi.mocked(isValidAddress).mockReturnValue(false)

    const { schema } = getDepositFormConfig({
      t,
      coin: tonCoin as any,
      walletCore: {} as any,
      totalAmountAvailable: 10,
      selectedChainAction: 'stake',
    })

    const result = schema.safeParse({
      amount: 1,
      validatorAddress: 'bad-address',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(
      'send_invalid_receiver_address'
    )
  })

  it('validates unstake amount and address', () => {
    vi.mocked(isValidAddress).mockReturnValue(true)

    const { schema } = getDepositFormConfig({
      t,
      coin: tonCoin as any,
      walletCore: {} as any,
      totalAmountAvailable: 3,
      selectedChainAction: 'unstake',
    })

    const result = schema.safeParse({
      amount: 2,
      validatorAddress: 'EQvalid',
    })

    expect(result.success).toBe(true)
  })

  it('requires merge node address to be valid', () => {
    vi.mocked(isValidAddress).mockImplementation(
      ({ address }) => address === 'thor1valid'
    )

    const { schema } = getDepositFormConfig({
      t,
      coin: { ...tonCoin, chain: Chain.THORChain } as any,
      walletCore: {} as any,
      totalAmountAvailable: 2,
      selectedChainAction: 'merge',
    })

    const invalid = schema.safeParse({ amount: 1, nodeAddress: 'bad' })
    expect(invalid.success).toBe(false)

    const valid = schema.safeParse({ amount: 1, nodeAddress: 'thor1valid' })
    expect(valid.success).toBe(true)
  })

  it('validates IBC destination address against selected chain', () => {
    vi.mocked(isValidAddress).mockImplementation(
      ({ chain, address }) =>
        chain === Chain.Osmosis && address === 'osmo1valid'
    )

    const { schema } = getDepositFormConfig({
      t,
      coin: { ...tonCoin, chain: Chain.Cosmos } as any,
      walletCore: {} as any,
      totalAmountAvailable: 10,
      selectedChainAction: 'ibc_transfer',
    })

    const invalid = schema.safeParse({
      amount: 1,
      destinationChain: Chain.Osmosis,
      nodeAddress: 'cosmosInvalid',
    })
    expect(invalid.success).toBe(false)

    const valid = schema.safeParse({
      amount: 1,
      destinationChain: Chain.Osmosis,
      nodeAddress: 'osmo1valid',
    })
    if (!valid.success) {
      // surface debug if this ever regresses
      console.error(valid.error.format())
    }
    expect(valid.success).toBe(true)
  })
})
