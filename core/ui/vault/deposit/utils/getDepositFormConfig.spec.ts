import { Chain } from '@vultisig/core-chain/Chain'
import { isValidAddress } from '@vultisig/core-chain/utils/isValidAddress'
import { TFunction } from 'i18next'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getDepositFormConfig } from './getDepositFormConfig'

/**
 * @vultisig/core-chain `coin/chainFeeCoin` imports `chains/cosmos/thor/kujira-merge.js`,
 * but the published package only provides `kujira-merge/index.js`, so the suite fails on
 * load in Vitest/Node ESM. Mock until the SDK fixes that internal re-export.
 */
vi.mock('@vultisig/core-chain/coin/chainFeeCoin', () => ({
  chainFeeCoin: {
    Solana: { ticker: 'SOL' },
    Ripple: { ticker: 'XRP', decimals: 6 },
  },
}))

vi.mock('@vultisig/core-chain/utils/isValidAddress', () => ({
  isValidAddress: vi.fn(),
}))

const t: TFunction = ((key: string) => key) as TFunction

const tonCoin = {
  chain: Chain.Ton,
  id: 'ton',
  ticker: 'GRAM',
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
