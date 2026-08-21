import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@vultisig/core-chain/chains/solana/kamino/tx/actions', () => ({
  buildKaminoDepositTransaction: vi.fn(),
}))
vi.mock('@vultisig/core-chain/chains/solana/kamino/tx/wire', () => ({
  parseKaminoWireTransaction: vi.fn(),
  serializeKaminoWireTransaction: vi.fn(),
  injectKaminoComputeBudget: vi.fn(),
  injectKaminoAttributionMemo: vi.fn(),
  refreshKaminoRecentBlockhash: vi.fn(),
}))
vi.mock('@vultisig/core-chain/chains/solana/kamino/tx/validate', () => ({
  validateKaminoTransactionOnline: vi.fn(),
}))
vi.mock(
  '@vultisig/core-chain/chains/solana/getDynamicPriorityFeePrice',
  () => ({
    getDynamicPriorityFeePrice: vi.fn(),
  })
)

import { Chain } from '@vultisig/core-chain/Chain'
import { getDynamicPriorityFeePrice } from '@vultisig/core-chain/chains/solana/getDynamicPriorityFeePrice'
import { kaminoTokenAmount } from '@vultisig/core-chain/chains/solana/kamino/amount'
import { kaminoVaultRegistry } from '@vultisig/core-chain/chains/solana/kamino/registry'
import { buildKaminoDepositTransaction } from '@vultisig/core-chain/chains/solana/kamino/tx/actions'
import { kaminoComputeBudget } from '@vultisig/core-chain/chains/solana/kamino/tx/computeBudget'
import { validateKaminoTransactionOnline } from '@vultisig/core-chain/chains/solana/kamino/tx/validate'
import {
  injectKaminoAttributionMemo,
  injectKaminoComputeBudget,
  parseKaminoWireTransaction,
  refreshKaminoRecentBlockhash,
  serializeKaminoWireTransaction,
} from '@vultisig/core-chain/chains/solana/kamino/tx/wire'

import { buildKaminoDepositKeysignPayload } from './buildKaminoDepositKeysignPayload'

const [steakhouse] = kaminoVaultRegistry
const owner = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

const vault = {
  descriptor: steakhouse,
  name: 'Steakhouse USDC',
  minDeposit: kaminoTokenAmount(100_100n, 6),
  minWithdraw: { unit: 'kaminoShare' as const, baseUnits: 2848n, decimals: 6 },
  lookupTable: 'D9pGqvkAaPJXjrbngmL3xeFbxNWDn1DrMYnV9vWKgHrE',
  apy30d: 0.0418,
  tokensPerShare: { numerator: 10536041812651029025n, scale: 19 },
  tokenPriceUsd: 1,
}

const input = {
  vault,
  coin: {
    chain: Chain.Solana,
    id: steakhouse.tokenMint,
    ticker: 'USDC',
    decimals: 6,
    address: owner,
  },
  amount: kaminoTokenAmount(1_000_000n, 6),
  hexPublicKey: 'ab'.repeat(32),
  vaultId: 'vault-id',
  localPartyId: 'party-1',
  libType: 1 as never,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(buildKaminoDepositTransaction).mockResolvedValue('built')
  vi.mocked(parseKaminoWireTransaction).mockReturnValue('parsed' as never)
  vi.mocked(injectKaminoComputeBudget).mockReturnValue('budgeted' as never)
  vi.mocked(injectKaminoAttributionMemo).mockReturnValue('memoed' as never)
  vi.mocked(refreshKaminoRecentBlockhash).mockResolvedValue('fresh' as never)
  vi.mocked(validateKaminoTransactionOnline).mockResolvedValue(undefined)
  vi.mocked(serializeKaminoWireTransaction).mockReturnValue('signable')
  vi.mocked(getDynamicPriorityFeePrice).mockResolvedValue(50_000)
})

describe('buildKaminoDepositKeysignPayload', () => {
  it('injects, refreshes and only then validates — in that order', async () => {
    // Order is the contract: validating before the injections would check a
    // transaction that is not the one being signed, and refreshing after the
    // validation would sign a blockhash nothing checked.
    await buildKaminoDepositKeysignPayload(input)

    expect(vi.mocked(injectKaminoComputeBudget).mock.calls[0][0]).toMatchObject(
      {
        transaction: 'parsed',
      }
    )
    expect(vi.mocked(injectKaminoAttributionMemo)).toHaveBeenCalledWith(
      'budgeted'
    )
    expect(vi.mocked(refreshKaminoRecentBlockhash)).toHaveBeenCalledWith(
      'memoed'
    )
    expect(
      vi.mocked(validateKaminoTransactionOnline).mock.calls[0][0]
    ).toMatchObject({ transaction: 'fresh' })
    expect(vi.mocked(serializeKaminoWireTransaction)).toHaveBeenCalledWith(
      'fresh'
    )
  })

  it('signs exactly the bytes it validated', async () => {
    const payload = await buildKaminoDepositKeysignPayload(input)

    expect(payload.signData.case).toBe('signSolana')
    expect(payload.signData.value).toMatchObject({
      rawTransactions: ['signable'],
    })
    expect(payload.toAddress).toBe(steakhouse.address)
    expect(payload.toAmount).toBe('1000000')
  })

  it('tells the validator the memo and fee it injected', async () => {
    await buildKaminoDepositKeysignPayload(input)

    const intent = vi.mocked(validateKaminoTransactionOnline).mock.calls[0][0]
      .intent
    expect(intent.carriesAttributionMemo).toBe(true)
    expect(intent.priorityFee?.unitPriceMicroLamports).toBe(50_000n)
    expect(intent.owner).toBe(owner)
    expect(intent.operation).toEqual({ deposit: input.amount })
  })

  it('falls back to the floor price when the fee sample fails', async () => {
    // A stalled sample must not hold up signing, and a transaction that tips
    // below the floor may not land before its blockhash expires.
    vi.mocked(getDynamicPriorityFeePrice).mockRejectedValue(new Error('rpc'))

    await buildKaminoDepositKeysignPayload(input)

    expect(
      vi.mocked(injectKaminoComputeBudget).mock.calls[0][0]
        .unitPriceMicroLamports
    ).toBe(kaminoComputeBudget.fallbackUnitPriceMicroLamports)
  })

  it('refuses bytes it cannot read rather than signing them', async () => {
    vi.mocked(parseKaminoWireTransaction).mockReturnValue(undefined)

    await expect(buildKaminoDepositKeysignPayload(input)).rejects.toThrow(
      /cannot read/
    )
    expect(vi.mocked(serializeKaminoWireTransaction)).not.toHaveBeenCalled()
  })

  it('propagates a validation refusal instead of signing', async () => {
    vi.mocked(validateKaminoTransactionOnline).mockRejectedValue(
      new Error('Kamino transaction refused (unexpectedMemo)')
    )

    await expect(buildKaminoDepositKeysignPayload(input)).rejects.toThrow(
      /refused/
    )
  })
})
