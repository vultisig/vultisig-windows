import { beforeEach, describe, expect, it, vi } from 'vitest'

const simulateTransaction = vi.fn()

vi.mock('@vultisig/core-chain/chains/solana/client', () => ({
  getSolanaClient: () => ({ simulateTransaction }),
}))
vi.mock('@vultisig/core-chain/chains/solana/kamino/tx/actions', () => ({
  buildKaminoWithdrawTransaction: vi.fn().mockResolvedValue('built'),
}))
vi.mock('@vultisig/core-chain/chains/solana/kamino/tx/wire', () => ({
  parseKaminoWireTransaction: vi.fn().mockReturnValue('parsed'),
  injectKaminoComputeBudget: vi.fn().mockReturnValue('budgeted'),
  injectKaminoAttributionMemo: vi.fn().mockReturnValue('memoed'),
  refreshKaminoRecentBlockhash: vi.fn().mockResolvedValue('fresh'),
  serializeKaminoWireTransaction: vi.fn().mockReturnValue('signable'),
}))
vi.mock('@vultisig/core-chain/chains/solana/kamino/tx/validate', () => ({
  validateKaminoTransactionOnline: vi.fn().mockResolvedValue(undefined),
}))
vi.mock(
  '@vultisig/core-chain/chains/solana/getDynamicPriorityFeePrice',
  () => ({ getDynamicPriorityFeePrice: vi.fn().mockResolvedValue(50_000) })
)
vi.mock('i18next', () => ({ t: (key: string) => key }))

import { Chain } from '@vultisig/core-chain/Chain'
import {
  kaminoShareAmount,
  kaminoTokenAmount,
} from '@vultisig/core-chain/chains/solana/kamino/amount'
import { kaminoVaultRegistry } from '@vultisig/core-chain/chains/solana/kamino/registry'
import { serializeKaminoWireTransaction } from '@vultisig/core-chain/chains/solana/kamino/tx/wire'

import { buildKaminoWithdrawKeysignPayload } from './buildKaminoWithdrawKeysignPayload'

const [steakhouse] = kaminoVaultRegistry

const input = {
  vault: {
    descriptor: steakhouse,
    name: 'Steakhouse USDC',
    minDeposit: kaminoTokenAmount(100_100n, 6),
    minWithdraw: kaminoShareAmount(2848n, 6),
    lookupTable: 'D9pGqvkAaPJXjrbngmL3xeFbxNWDn1DrMYnV9vWKgHrE',
    apy30d: 0.0418,
    tokensPerShare: { numerator: 10536041812651029025n, scale: 19 },
    tokenPriceUsd: 1,
  },
  coin: {
    chain: Chain.Solana,
    id: steakhouse.tokenMint,
    ticker: 'USDC',
    decimals: 6,
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  },
  request: {
    shares: kaminoShareAmount(1_000_000n, 6),
    unstakedShares: kaminoShareAmount(1_000_000n, 6),
  },
  hexPublicKey: 'ab'.repeat(32),
  vaultId: 'vault-id',
  localPartyId: 'party-1',
  libType: 1 as never,
}

const simulates = (err: unknown, logs: string[] = []) =>
  simulateTransaction.mockResolvedValue({ value: { err, logs } })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('buildKaminoWithdrawKeysignPayload', () => {
  it('signs the simulated bytes when the withdraw would land', async () => {
    simulates(null)
    const payload = await buildKaminoWithdrawKeysignPayload(input)

    expect(simulateTransaction.mock.calls[0][0]).toBe('fresh')
    expect(payload.signData.value).toMatchObject({
      rawTransactions: ['signable'],
    })
  })

  it('refuses a payer short of SOL before building a payload', async () => {
    simulates('AccountNotFound')

    await expect(buildKaminoWithdrawKeysignPayload(input)).rejects.toThrow(
      'kamino_earn_insufficient_sol'
    )
    expect(vi.mocked(serializeKaminoWireTransaction)).not.toHaveBeenCalled()
  })

  it('keeps the runtime reason when the Token program fails', async () => {
    simulates({ InstructionError: [3, { Custom: 1 }] }, [
      'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA failed: custom program error: 0x1',
    ])

    await expect(buildKaminoWithdrawKeysignPayload(input)).rejects.toThrow(
      'kamino_earn_simulation_failed'
    )
  })
})
