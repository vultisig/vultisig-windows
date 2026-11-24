import { create } from '@bufbuild/protobuf'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token'
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { initWasm, WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { getTxBlockaidSimulation } from '@vultisig/core-chain/security/blockaid/tx/simulation'
import { BlockaidSolanaSimulation } from '@vultisig/core-chain/security/blockaid/tx/simulation/api/core'
import { getChainSpecific } from '@vultisig/core-mpc/keysign/chainSpecific'
import { getBlockaidTxSimulationInput } from '@vultisig/core-mpc/security/blockaid/tx/simulation/input'
import { SolanaSpecificSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { CoinSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { oneInchSwapProgram } from './parseProgramCall/swapPrograms'
import { parseSolanaTx } from './parser'

vi.mock('@vultisig/core-chain/security/blockaid/tx/simulation', () => ({
  getTxBlockaidSimulation: vi.fn(),
}))
vi.mock('@vultisig/core-mpc/keysign/chainSpecific', () => ({
  getChainSpecific: vi.fn(),
}))
vi.mock('@vultisig/core-mpc/security/blockaid/tx/simulation/input', () => ({
  getBlockaidTxSimulationInput: vi.fn(),
}))

const mint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const wsol = 'So11111111111111111111111111111111111111112'
type Diff =
  BlockaidSolanaSimulation['account_summary']['account_assets_diff'][number]
const movement = (asset: Diff['asset'], amount: bigint): Diff => {
  const value = {
    raw_value: String(amount < 0n ? -amount : amount),
    value: 0,
    usd_price: 0,
    summary: '',
  }
  return {
    asset,
    asset_type: asset.type,
    in: amount > 0n ? value : null,
    out: amount < 0n ? value : null,
  }
}
const simulation = (sol: bigint, token: bigint): BlockaidSolanaSimulation => ({
  account_summary: {
    account_assets_diff: [
      movement({ type: 'SOL', decimals: 9, logo: '' }, sol),
      movement(
        { type: 'TOKEN', address: wsol, decimals: 9, logo: '' },
        sol > 0n ? -2039280n : 2039280n
      ),
      movement({ type: 'TOKEN', address: mint, decimals: 6, logo: '' }, token),
    ],
  },
})
const solSent = (lamports: bigint): BlockaidSolanaSimulation => ({
  account_summary: {
    account_assets_diff: [
      movement({ type: 'SOL', decimals: 9, logo: '' }, -lamports),
    ],
  },
})
const noMovement: BlockaidSolanaSimulation = {
  account_summary: { account_assets_diff: [] },
}

let walletCore: WalletCore
const sender = Keypair.fromSeed(new Uint8Array(32).fill(1)).publicKey
const recipient = Keypair.fromSeed(new Uint8Array(32).fill(2)).publicKey
const unknownProgram = Keypair.fromSeed(new Uint8Array(32).fill(3)).publicKey
const serialize = (...instructions: TransactionInstruction[]) => [
  new Transaction({
    feePayer: sender,
    recentBlockhash: wsol,
  })
    .add(...instructions)
    .serialize({ requireAllSignatures: false, verifySignatures: false })
    .toString('base64'),
]
const transferTo = (to: PublicKey) =>
  SystemProgram.transfer({ fromPubkey: sender, toPubkey: to, lamports: 1 })
const data = serialize(transferTo(recipient))
const selfTransferData = serialize(transferTo(sender))
const transferWithPriorityFee = serialize(
  ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 }),
  transferTo(recipient)
)
const transferWithUnknownInstruction = serialize(
  transferTo(recipient),
  new TransactionInstruction({
    programId: unknownProgram,
    keys: [],
    data: Buffer.alloc(0),
  })
)
const twoTransfers = serialize(transferTo(recipient), transferTo(sender))
const createTokenAccount = (payer: PublicKey) =>
  createAssociatedTokenAccountInstruction(
    payer,
    getAssociatedTokenAddressSync(new PublicKey(mint), recipient),
    recipient,
    new PublicKey(mint)
  )
const transferWithVaultFundedTokenAccount = serialize(
  createTokenAccount(sender),
  transferTo(recipient)
)
const transferWithSponsoredTokenAccount = serialize(
  createTokenAccount(unknownProgram),
  transferTo(recipient)
)
const transferWithSponsoredIdempotentTokenAccount = serialize(
  createAssociatedTokenAccountIdempotentInstruction(
    unknownProgram,
    getAssociatedTokenAddressSync(new PublicKey(mint), recipient),
    recipient,
    new PublicKey(mint)
  ),
  transferTo(recipient)
)
// RecoverNested: account 0 is the nested token account, not a payer.
const transferWithRecoverNested = serialize(
  new TransactionInstruction({
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: unknownProgram, isSigner: false, isWritable: true },
      { pubkey: new PublicKey(mint), isSigner: false, isWritable: false },
      { pubkey: recipient, isSigner: false, isWritable: true },
      { pubkey: sender, isSigner: true, isWritable: true },
    ],
    data: Buffer.from([2]),
  }),
  transferTo(recipient)
)
const serializeV0 = (...instructions: TransactionInstruction[]) => [
  Buffer.from(
    new VersionedTransaction(
      new TransactionMessage({
        payerKey: sender,
        recentBlockhash: wsol,
        instructions,
      }).compileToV0Message()
    ).serialize()
  ).toString('base64'),
]
const formats = [
  ['legacy', serialize],
  ['v0', serializeV0],
] as const
const oneInchInAmount = 1000000n
const oneInchOutAmount = 5000000n
// The 1inch parser reads the source mint, maker and destination mint from
// accounts 2, 5 and 7, and the amounts from data bytes 12 and 20.
const oneInchSwap = () => {
  const programData = Buffer.alloc(28)
  programData.writeBigUInt64LE(oneInchInAmount, 12)
  programData.writeBigUInt64LE(oneInchOutAmount, 20)
  const account = (pubkey: PublicKey, isSigner = false) => ({
    pubkey,
    isSigner,
    isWritable: isSigner,
  })
  return new TransactionInstruction({
    programId: new PublicKey(oneInchSwapProgram),
    keys: [
      account(unknownProgram),
      account(unknownProgram),
      account(new PublicKey(mint)),
      account(unknownProgram),
      account(unknownProgram),
      account(sender, true),
      account(unknownProgram),
      account(new PublicKey(wsol)),
    ],
    data: programData,
  })
}
const tokenTransferTo = (to: PublicKey) =>
  createTransferInstruction(
    getAssociatedTokenAddressSync(new PublicKey(mint), sender),
    getAssociatedTokenAddressSync(new PublicKey(mint), to),
    sender,
    1
  )
const unknownInstruction = () =>
  new TransactionInstruction({
    programId: unknownProgram,
    keys: [],
    data: Buffer.alloc(0),
  })
const swapWithHiddenInstructions: [string, () => TransactionInstruction[]][] = [
  ['1inch then SOL transfer', () => [oneInchSwap(), transferTo(recipient)]],
  ['SOL transfer then 1inch', () => [transferTo(recipient), oneInchSwap()]],
  [
    '1inch then token transfer',
    () => [oneInchSwap(), tokenTransferTo(recipient)],
  ],
  [
    'token transfer then 1inch',
    () => [tokenTransferTo(recipient), oneInchSwap()],
  ],
  ['1inch then unknown program', () => [oneInchSwap(), unknownInstruction()]],
  ['unknown program then 1inch', () => [unknownInstruction(), oneInchSwap()]],
  [
    '1inch then vault-funded token account',
    () => [oneInchSwap(), createTokenAccount(sender)],
  ],
  ['two 1inch instructions', () => [oneInchSwap(), oneInchSwap()]],
]
const fromCoin = create(CoinSchema, {
  chain: Chain.Solana,
  address: sender.toBase58(),
  ticker: 'SOL',
  decimals: 9,
})
const getCoin = vi.fn(async ({ id }: { id?: string }) =>
  id
    ? { chain: Chain.Solana, id, ticker: 'USDC', decimals: 6, logo: '' }
    : chainFeeCoin.Solana
)
const parse = (transactions = data) =>
  parseSolanaTx({
    fromCoin,
    walletCore,
    data: transactions,
    getCoin,
    swapProvider: 'test',
  })

beforeAll(async () => {
  walletCore = await initWasm()
})
beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getChainSpecific).mockResolvedValue({
    case: 'solanaSpecific',
    value: create(SolanaSpecificSchema),
  })
  vi.mocked(getBlockaidTxSimulationInput).mockResolvedValue({
    chain: Chain.Solana,
    data: { account_address: sender.toBase58(), transactions: data },
  })
})

describe('Solana approval with the shared simulation parser', () => {
  it('still decodes instructions when the simulation service is unavailable', async () => {
    vi.mocked(getTxBlockaidSimulation).mockRejectedValue(
      new Error('Unavailable')
    )
    await expect(parse()).resolves.toMatchObject({
      transfer: {
        inAmount: '1',
        receiverAddress: recipient.toBase58(),
        rawTransactions: data,
      },
    })
  })

  it('names the destination when the decoded transfer matches the simulated movement', async () => {
    vi.mocked(getTxBlockaidSimulation).mockResolvedValue(solSent(1n))
    await expect(parse()).resolves.toMatchObject({
      transfer: {
        inAmount: '1',
        inputCoin: { ticker: 'SOL' },
        receiverAddress: recipient.toBase58(),
        rawTransactions: data,
      },
    })
  })

  it('leaves the destination unknown when the decoded transfer disagrees with the simulation', async () => {
    vi.mocked(getTxBlockaidSimulation).mockResolvedValue(solSent(2n))
    await expect(parse()).resolves.toMatchObject({
      transfer: { inAmount: '2', receiverAddress: '', rawTransactions: data },
    })
  })

  it('leaves the destination unknown when the transfer shares the transaction with an unknown instruction', async () => {
    vi.mocked(getTxBlockaidSimulation).mockResolvedValue(solSent(1n))
    await expect(parse(transferWithUnknownInstruction)).resolves.toMatchObject({
      transfer: {
        inAmount: '1',
        receiverAddress: '',
        rawTransactions: transferWithUnknownInstruction,
      },
    })
  })

  it('decodes a transfer back to the sender when the simulation reports no movement', async () => {
    vi.mocked(getTxBlockaidSimulation).mockResolvedValue(noMovement)
    await expect(parse(selfTransferData)).resolves.toMatchObject({
      transfer: {
        inAmount: '1',
        receiverAddress: sender.toBase58(),
        rawTransactions: selfTransferData,
      },
    })
  })

  describe('with no simulation to lean on', () => {
    beforeEach(() => {
      vi.mocked(getTxBlockaidSimulation).mockRejectedValue(
        new Error('Unavailable')
      )
    })

    it('decodes a transfer that only carries a priority fee alongside', async () => {
      await expect(parse(transferWithPriorityFee)).resolves.toMatchObject({
        transfer: { inAmount: '1', receiverAddress: recipient.toBase58() },
      })
    })

    it('keeps a transfer that shares the transaction with an unknown instruction on raw review', async () => {
      await expect(parse(transferWithUnknownInstruction)).resolves.toEqual({
        raw: expect.objectContaining({
          transactions: transferWithUnknownInstruction,
        }),
      })
    })

    it('keeps a transaction with two transfers on raw review', async () => {
      await expect(parse(twoTransfers)).resolves.toEqual({
        raw: expect.objectContaining({ transactions: twoTransfers }),
      })
    })

    it('keeps a transfer on raw review when the vault also pays to create a token account', async () => {
      await expect(parse(transferWithVaultFundedTokenAccount)).resolves.toEqual(
        {
          raw: expect.objectContaining({
            transactions: transferWithVaultFundedTokenAccount,
          }),
        }
      )
    })

    it.each([
      ['create', transferWithSponsoredTokenAccount],
      ['create idempotent', transferWithSponsoredIdempotentTokenAccount],
    ])(
      'decodes a transfer when someone else pays for the token account it creates (%s)',
      async (_, transactions) => {
        await expect(parse(transactions)).resolves.toMatchObject({
          transfer: { inAmount: '1', receiverAddress: recipient.toBase58() },
        })
      }
    )

    it('keeps a transfer on raw review next to any other associated token instruction', async () => {
      await expect(parse(transferWithRecoverNested)).resolves.toEqual({
        raw: expect.objectContaining({
          transactions: transferWithRecoverNested,
        }),
      })
    })
  })

  it.each([
    [1000000000n, 1000000n],
    [-1000000000n, -1000000n],
  ])(
    'preserves raw review when complete movements cannot produce a safe headline (%s)',
    async (sol, token) => {
      vi.mocked(getTxBlockaidSimulation).mockResolvedValue(
        simulation(sol, token)
      )
      await expect(parse()).resolves.toMatchObject({
        raw: { transactions: data },
      })
      expect(getCoin).not.toHaveBeenCalled()
    }
  )

  it.each([
    {
      sol: 1000000000n,
      token: -1000000n,
      inputTicker: 'USDC',
      outputTicker: 'SOL',
      input: '1000000',
      output: '997960720',
    },
    {
      sol: -1000000000n,
      token: 1000000n,
      inputTicker: 'SOL',
      outputTicker: 'USDC',
      input: '997960720',
      output: '1000000',
    },
  ])(
    'keeps the full principal direction for $inputTicker to $outputTicker',
    async scenario => {
      vi.mocked(getTxBlockaidSimulation).mockResolvedValue(
        simulation(scenario.sol, scenario.token)
      )
      await expect(parse()).resolves.toMatchObject({
        swap: {
          inputCoin: { ticker: scenario.inputTicker },
          outputCoin: { ticker: scenario.outputTicker },
          inAmount: scenario.input,
          outAmount: scenario.output,
          rawTransactions: data,
        },
      })
    }
  )
})

describe('Solana approval of a 1inch swap', () => {
  const blockaidWithoutVerdict = [
    [
      'the simulation service is unavailable',
      () =>
        vi
          .mocked(getTxBlockaidSimulation)
          .mockRejectedValue(new Error('Unavailable')),
    ],
    [
      'the simulation reports no movement',
      () => vi.mocked(getTxBlockaidSimulation).mockResolvedValue(noMovement),
    ],
  ] as const

  describe.each(blockaidWithoutVerdict)('when %s', (_, mockBlockaid) => {
    beforeEach(() => {
      mockBlockaid()
    })

    describe.each(formats)('in a %s transaction', (_, toTransactions) => {
      it.each([
        ['alone', () => [oneInchSwap()]],
        [
          'with compute-budget instructions',
          () => [
            ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }),
            ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 }),
            oneInchSwap(),
          ],
        ],
      ])('summarises the swap %s', async (_, instructions) => {
        const transactions = toTransactions(...instructions())
        await expect(parse(transactions)).resolves.toMatchObject({
          swap: {
            authority: sender.toBase58(),
            inAmount: oneInchInAmount.toString(),
            inputCoin: { id: mint },
            outAmount: oneInchOutAmount.toString(),
            outputCoin: { ticker: 'SOL' },
            rawTransactions: transactions,
          },
        })
      })

      it.each(swapWithHiddenInstructions)(
        'keeps %s on raw review',
        async (_, instructions) => {
          const transactions = toTransactions(...instructions())
          await expect(parse(transactions)).resolves.toEqual({
            raw: expect.objectContaining({ transactions }),
          })
        }
      )
    })
  })

  describe.each(formats)(
    'when the simulation reports movements for a %s transaction with a hidden transfer',
    (_, toTransactions) => {
      const transactions = toTransactions(oneInchSwap(), transferTo(recipient))

      it('takes the swap amounts from the simulation, not the 1inch instruction', async () => {
        vi.mocked(getTxBlockaidSimulation).mockResolvedValue(
          simulation(1000000000n, -1000000n)
        )
        await expect(parse(transactions)).resolves.toMatchObject({
          swap: {
            inAmount: '1000000',
            outAmount: '997960720',
            rawTransactions: transactions,
          },
        })
      })

      it('reports the simulated transfer without naming a destination', async () => {
        vi.mocked(getTxBlockaidSimulation).mockResolvedValue(solSent(1n))
        await expect(parse(transactions)).resolves.toMatchObject({
          transfer: {
            inAmount: '1',
            receiverAddress: '',
            rawTransactions: transactions,
          },
        })
      })
    }
  )
})
