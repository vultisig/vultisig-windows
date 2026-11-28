import { Chain } from '@vultisig/core-chain/Chain'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { isValidAddress } from '@vultisig/core-chain/utils/isValidAddress'
import { TFunction } from 'i18next'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getDepositFormConfig } from './getDepositFormConfig'
import { generateMemo } from './memoGenerator'

vi.mock('@vultisig/core-chain/utils/isValidAddress', () => ({
  isValidAddress: vi.fn(),
}))

const t: TFunction = ((key: string) => key) as TFunction

const cosmosCoin: AccountCoin = {
  chain: Chain.Cosmos,
  id: 'uatom',
  ticker: 'ATOM',
  decimals: 6,
  address: 'sender',
}

describe('IBC transfer validation', () => {
  beforeEach(() => {
    vi.mocked(isValidAddress).mockReset()
  })

  it('validates IBC destination address against selected chain', () => {
    vi.mocked(isValidAddress).mockImplementation(
      ({ chain, address }) =>
        chain === Chain.Osmosis && address === 'osmo1valid'
    )

    const { schema } = getDepositFormConfig({
      t,
      coin: cosmosCoin,
      walletCore: {} as any,
      totalAmountAvailable: 10,
      totalAmountAvailableUnits: null,
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

/**
 * `totalAmountAvailable` for a delegate is the STAKEABLE balance (liquid SOL
 * minus the stake account's rent-exempt reserve and the fee) — see
 * `useSolanaStakeableBalance`. The schema is what the footer CTA gates on, so an
 * amount above that ceiling has to fail here or the ceremony signs a transaction
 * the network rejects at simulation.
 */
describe('Solana delegate validation', () => {
  const solCoin = {
    chain: Chain.Solana,
    id: 'SOL',
    ticker: 'SOL',
    decimals: 9,
    address: 'sender',
  }

  const parseDelegate = ({
    stakeable,
    amount,
  }: {
    stakeable: number
    amount: number
  }) => {
    const { schema } = getDepositFormConfig({
      t,
      coin: solCoin as any,
      walletCore: {} as any,
      totalAmountAvailable: stakeable,
      totalAmountAvailableUnits: null,
      selectedChainAction: 'solana_delegate',
    })

    return schema.safeParse({ amount, validatorAddress: 'vote-pubkey' })
  }

  it('rejects an amount above the stakeable balance', () => {
    const result = parseDelegate({ stakeable: 1.571, amount: 267 })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(
      'chainFunctions.amountExceeded'
    )
  })

  it('rejects a stake of the full balance once rent + fee are reserved', () => {
    const result = parseDelegate({ stakeable: 9.997, amount: 10 })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(
      'chainFunctions.amountExceeded'
    )
  })

  it('rejects an amount below the 1 SOL program minimum', () => {
    const result = parseDelegate({ stakeable: 10, amount: 0.5 })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toBe(
      'solana_staking_min_delegation'
    )
  })

  it('accepts a stake of the whole stakeable balance', () => {
    expect(parseDelegate({ stakeable: 9.997, amount: 9.997 }).success).toBe(
      true
    )
  })

  it('reports insufficient balance when nothing is stakeable', () => {
    const result = parseDelegate({ stakeable: 0, amount: 1 })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map(issue => issue.message)).toContain(
      'insufficient_balance'
    )
  })
})

describe('Ripple open trust line affordability', () => {
  const rippleCoin = {
    chain: Chain.Ripple,
    ticker: 'XRP',
    decimals: 6,
    address: 'rSender',
  }

  const parseTrustLine = ({
    spendableXrp,
    trustLineCostXrp,
  }: {
    spendableXrp: number
    trustLineCostXrp?: number
  }) => {
    vi.mocked(isValidAddress).mockReturnValue(true)

    const { schema } = getDepositFormConfig({
      t,
      coin: rippleCoin as any,
      walletCore: {} as any,
      totalAmountAvailable: spendableXrp,
      totalAmountAvailableUnits: null,
      selectedChainAction: 'open_trust_line',
      trustLineCostXrp,
    })

    return schema.safeParse({
      issuer: 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De',
      currency: 'SOLO',
      amount: 1e15,
    })
  }

  it('blocks when spendable XRP will not cover the reserve and fee', () => {
    const result = parseTrustLine({ spendableXrp: 0.1, trustLineCostXrp: 0.2 })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map(issue => issue.message)).toContain(
      'trust_line_insufficient_xrp'
    )
  })

  it('allows an activation the balance exactly covers', () => {
    expect(
      parseTrustLine({ spendableXrp: 0.2, trustLineCostXrp: 0.2 }).success
    ).toBe(true)
  })

  it('does not block while the cost is still unknown', () => {
    // A pending quote must not gate the form on a figure it does not have.
    expect(parseTrustLine({ spendableXrp: 0 }).success).toBe(true)
  })
})

describe('THORChain bond and unbond validation', () => {
  const runeCoin: AccountCoin = {
    chain: Chain.THORChain,
    ticker: 'RUNE',
    decimals: 8,
    address: 'thor1sender',
  }

  beforeEach(() => {
    vi.mocked(isValidAddress).mockReset()
    vi.mocked(isValidAddress).mockImplementation(
      ({ chain, address }) =>
        chain === Chain.THORChain && address.startsWith('thor1')
    )
  })

  const getSchema = (selectedChainAction: 'bond' | 'unbond') =>
    getDepositFormConfig({
      t,
      coin: runeCoin,
      walletCore: {} as any,
      totalAmountAvailable: 10,
      totalAmountAvailableUnits: null,
      selectedChainAction,
    }).schema

  const parseBond = (input: Record<string, unknown>) =>
    getSchema('bond').safeParse({
      nodeAddress: 'thor1node',
      amount: '1',
      ...input,
    })

  const issueMessages = (result: ReturnType<typeof parseBond>) =>
    result.error?.issues.map(issue => issue.message) ?? []

  it('accepts a bond with no provider and no fee', () => {
    expect(parseBond({}).success).toBe(true)
  })

  it.each([0, 1, 2000, 10000])('accepts an operator fee of %s', fee => {
    expect(parseBond({ operatorFee: fee }).success).toBe(true)
  })

  it.each([-1, 10001, 12.5])('rejects an operator fee of %s', fee => {
    const result = parseBond({ operatorFee: fee })

    expect(result.success).toBe(false)
    expect(issueMessages(result)).toEqual(['operator_fee_range_error'])
  })

  it('reads the Function form fee string as basis points', () => {
    expect(parseBond({ operatorFee: '10000' }).success).toBe(true)
    expect(issueMessages(parseBond({ operatorFee: '10001' }))).toEqual([
      'operator_fee_range_error',
    ])
  })

  // The bond form's fee is a text input, so partial entries a number input
  // would have reported as empty reach the schema as typed.
  it.each(['1e309', '-1e309', 'abc', '1e', '-', '.', Number.POSITIVE_INFINITY])(
    'rejects a fee entry of %s instead of dropping it',
    fee => {
      expect(issueMessages(parseBond({ operatorFee: fee }))).toEqual([
        'operator_fee_range_error',
      ])
    }
  )

  it('treats an empty fee input as no fee', () => {
    expect(parseBond({ operatorFee: '' }).success).toBe(true)
    expect(parseBond({ operatorFee: '  ' }).success).toBe(true)
    expect(parseBond({ operatorFee: Number.NaN }).success).toBe(true)
  })

  it('accepts a THORChain provider address', () => {
    expect(parseBond({ provider: 'thor1provider' }).success).toBe(true)
    expect(isValidAddress).toHaveBeenCalledWith(
      expect.objectContaining({
        chain: Chain.THORChain,
        address: 'thor1provider',
      })
    )
  })

  it('rejects a provider that is not a THORChain address', () => {
    const result = parseBond({ provider: 'bc1qnotthor' })

    expect(result.success).toBe(false)
    expect(issueMessages(result)).toEqual(['invalid_provider_address'])
  })

  it('treats an empty provider as no provider', () => {
    expect(parseBond({ provider: '' }).success).toBe(true)
  })

  it('validates the unbond provider the same way', () => {
    const parseUnbond = (provider: string) =>
      getSchema('unbond').safeParse({
        nodeAddress: 'thor1node',
        amount: '1',
        provider,
      })

    expect(parseUnbond('thor1provider').success).toBe(true)
    expect(parseUnbond('').success).toBe(true)
    expect(
      parseUnbond('bc1qnotthor').error?.issues.map(issue => issue.message)
    ).toEqual(['invalid_provider_address'])
  })

  it('submits a fee-only bond as a memo with an empty provider slot', () => {
    // The Function form holds raw strings; what it submits is the schema's
    // parsed output, which is what the memo is built from.
    const result = parseBond({ provider: '', operatorFee: '500' })
    if (!result.success) throw result.error
    const { data } = result
    if (typeof data !== 'object' || data === null) {
      throw new Error('Expected parsed bond form values')
    }

    const memo = generateMemo({
      selectedChainAction: 'bond',
      depositFormData: { ...data },
      bondableAsset: 'THOR.RUNE',
      chain: Chain.THORChain,
      coin: runeCoin,
    })

    expect(memo).toBe('BOND:thor1node::500')
  })
})
