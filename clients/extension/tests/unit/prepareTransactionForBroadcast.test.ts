import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ComputeBudgetInstruction,
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { solanaConfig } from '@vultisig/core-chain/chains/solana/solanaConfig'

import { prepareTransactionForBroadcast } from '@clients/extension/src/inpage/providers/solana/prepareTransactionForBroadcast'

const hoisted = vi.hoisted(() => ({
  getLatestBlockhash: vi.fn(),
  getAddressLookupTable: vi.fn(),
  getDynamicPriorityFeePrice: vi.fn(),
}))

vi.mock('@vultisig/core-chain/chains/solana/client', () => ({
  getSolanaClient: () => ({
    getLatestBlockhash: hoisted.getLatestBlockhash,
    getAddressLookupTable: hoisted.getAddressLookupTable,
  }),
}))

vi.mock('@vultisig/core-chain/chains/solana/getDynamicPriorityFeePrice', () => ({
  getDynamicPriorityFeePrice: hoisted.getDynamicPriorityFeePrice,
}))

const memoProgramId = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
)

describe('prepareTransactionForBroadcast', () => {
  beforeEach(() => {
    hoisted.getLatestBlockhash.mockReset()
    hoisted.getAddressLookupTable.mockReset()
    hoisted.getDynamicPriorityFeePrice.mockReset()
  })

  it('prepends compute budget, refreshes blockhash, and keeps transfer + memo on legacy tx', async () => {
    const payer = Keypair.generate().publicKey
    const to = Keypair.generate().publicKey
    const freshBlockhash = 'b'.repeat(32)

    hoisted.getLatestBlockhash.mockResolvedValue({
      blockhash: freshBlockhash,
      lastValidBlockHeight: 99n,
    })
    hoisted.getDynamicPriorityFeePrice.mockResolvedValue(2_500_000)

    const transferIx = SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: to,
      lamports: 1,
    })
    const memoIx = new TransactionInstruction({
      keys: [{ pubkey: payer, isSigner: true, isWritable: true }],
      programId: memoProgramId,
      data: Buffer.from('thor:memo', 'utf8'),
    })

    const tx = new Transaction({
      feePayer: payer,
      recentBlockhash: 'a'.repeat(32),
    })
    tx.add(transferIx, memoIx)

    const out = await prepareTransactionForBroadcast(tx)

    expect(out).not.toBe(tx)
    expect(out.recentBlockhash).toBe(freshBlockhash)
    expect(out.lastValidBlockHeight).toBe(99n)
    expect(out.instructions.length).toBe(4)

    const limitKind = ComputeBudgetInstruction.decodeInstructionType(
      out.instructions[0]!
    )
    const priceKind = ComputeBudgetInstruction.decodeInstructionType(
      out.instructions[1]!
    )
    expect(limitKind).toBe('SetComputeUnitLimit')
    expect(priceKind).toBe('SetComputeUnitPrice')

    const { units } = ComputeBudgetInstruction.decodeSetComputeUnitLimit(
      out.instructions[0]!
    )
    const { microLamports } =
      ComputeBudgetInstruction.decodeSetComputeUnitPrice(out.instructions[1]!)

    expect(units).toBe(solanaConfig.priorityFeeLimit)
    expect(Number(microLamports)).toBe(2_500_000)

    expect(out.instructions[2]).toEqual(transferIx)
    expect(out.instructions[3]).toEqual(memoIx)

    expect(hoisted.getDynamicPriorityFeePrice).toHaveBeenCalledTimes(1)
    const writableArg = hoisted.getDynamicPriorityFeePrice.mock.calls[0]![0]
    expect(writableArg?.some(k => k.equals(payer))).toBe(true)
    expect(writableArg?.some(k => k.equals(to))).toBe(true)
  })

  it('strips prior compute unit limit/price so dApp lows are not retained', async () => {
    const payer = Keypair.generate().publicKey
    const to = Keypair.generate().publicKey

    hoisted.getLatestBlockhash.mockResolvedValue({
      blockhash: 'c'.repeat(32),
      lastValidBlockHeight: 1n,
    })
    hoisted.getDynamicPriorityFeePrice.mockResolvedValue(solanaConfig.priorityFeePrice)

    const tx = new Transaction({
      feePayer: payer,
      recentBlockhash: 'a'.repeat(32),
    })
    tx.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 500 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 }),
      SystemProgram.transfer({ fromPubkey: payer, toPubkey: to, lamports: 1 })
    )

    const out = await prepareTransactionForBroadcast(tx)
    const { units } = ComputeBudgetInstruction.decodeSetComputeUnitLimit(
      out.instructions[0]!
    )
    expect(units).toBe(solanaConfig.priorityFeeLimit)
    expect(out.instructions.length).toBe(3)
  })

  it('preserves dApp compute limit and price when they are above the wallet defaults', async () => {
    const payer = Keypair.generate().publicKey
    const to = Keypair.generate().publicKey
    const highLimit = solanaConfig.priorityFeeLimit + 50_000
    const highPrice = solanaConfig.priorityFeePrice + 2_000_000

    hoisted.getLatestBlockhash.mockResolvedValue({
      blockhash: 'e'.repeat(32),
      lastValidBlockHeight: 7n,
    })
    hoisted.getDynamicPriorityFeePrice.mockResolvedValue(
      solanaConfig.priorityFeePrice
    )

    const tx = new Transaction({
      feePayer: payer,
      recentBlockhash: 'a'.repeat(32),
    })
    tx.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: highLimit }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: highPrice }),
      SystemProgram.transfer({ fromPubkey: payer, toPubkey: to, lamports: 1 })
    )

    const out = await prepareTransactionForBroadcast(tx)
    const { units } = ComputeBudgetInstruction.decodeSetComputeUnitLimit(
      out.instructions[0]!
    )
    const { microLamports } =
      ComputeBudgetInstruction.decodeSetComputeUnitPrice(out.instructions[1]!)

    expect(units).toBe(highLimit)
    expect(Number(microLamports)).toBe(highPrice)
    expect(out.instructions.length).toBe(3)
  })

  it('returns the original transaction when blockhash fetch fails', async () => {
    const payer = Keypair.generate().publicKey
    const to = Keypair.generate().publicKey

    hoisted.getLatestBlockhash.mockRejectedValue(new Error('rpc down'))
    hoisted.getDynamicPriorityFeePrice.mockResolvedValue(1_000_000)

    const tx = new Transaction({
      feePayer: payer,
      recentBlockhash: 'a'.repeat(32),
    })
    tx.add(SystemProgram.transfer({ fromPubkey: payer, toPubkey: to, lamports: 1 }))

    const out = await prepareTransactionForBroadcast(tx)

    expect(out).toBe(tx)
    expect(out.recentBlockhash).toBe('a'.repeat(32))
  })

  it('falls back to the configured priority fee when dynamic fee fetch fails', async () => {
    const payer = Keypair.generate().publicKey
    const to = Keypair.generate().publicKey

    hoisted.getLatestBlockhash.mockResolvedValue({
      blockhash: 'd'.repeat(32),
      lastValidBlockHeight: 2n,
    })
    hoisted.getDynamicPriorityFeePrice.mockRejectedValue(new Error('fee error'))

    const tx = new Transaction({
      feePayer: payer,
      recentBlockhash: 'a'.repeat(32),
    })
    tx.add(SystemProgram.transfer({ fromPubkey: payer, toPubkey: to, lamports: 1 }))

    const out = await prepareTransactionForBroadcast(tx)

    expect(out).not.toBe(tx)
    const { microLamports } =
      ComputeBudgetInstruction.decodeSetComputeUnitPrice(out.instructions[1]!)
    expect(Number(microLamports)).toBe(solanaConfig.priorityFeePrice)
  })

  it('returns legacy tx unchanged when fee payer is missing', async () => {
    const tx = new Transaction({ recentBlockhash: 'a'.repeat(32) })
    tx.add(
      SystemProgram.transfer({
        fromPubkey: Keypair.generate().publicKey,
        toPubkey: Keypair.generate().publicKey,
        lamports: 1,
      })
    )

    const out = await prepareTransactionForBroadcast(tx)

    expect(out).toBe(tx)
    expect(hoisted.getLatestBlockhash).not.toHaveBeenCalled()
  })

  it('returns legacy tx unchanged when durable nonce metadata is present', async () => {
    const payer = Keypair.generate().publicKey
    const nonceAccount = Keypair.generate().publicKey
    const to = Keypair.generate().publicKey

    const tx = new Transaction({
      feePayer: payer,
      recentBlockhash: 'a'.repeat(32),
    })
    tx.nonceInfo = {
      nonce: 'n'.repeat(32),
      nonceInstruction: SystemProgram.nonceAdvance({
        noncePubkey: nonceAccount,
        authorizedPubkey: payer,
      }),
    }
    tx.add(
      SystemProgram.transfer({ fromPubkey: payer, toPubkey: to, lamports: 1 })
    )

    const out = await prepareTransactionForBroadcast(tx)

    expect(out).toBe(tx)
    expect(hoisted.getLatestBlockhash).not.toHaveBeenCalled()
  })

  it('returns legacy tx unchanged when it advances a durable nonce', async () => {
    const payer = Keypair.generate().publicKey
    const nonceAccount = Keypair.generate().publicKey
    const to = Keypair.generate().publicKey

    const tx = new Transaction({
      feePayer: payer,
      recentBlockhash: 'a'.repeat(32),
    })
    tx.add(
      SystemProgram.nonceAdvance({
        noncePubkey: nonceAccount,
        authorizedPubkey: payer,
      }),
      SystemProgram.transfer({ fromPubkey: payer, toPubkey: to, lamports: 1 })
    )

    const out = await prepareTransactionForBroadcast(tx)

    expect(out).toBe(tx)
    expect(hoisted.getLatestBlockhash).not.toHaveBeenCalled()
  })

  it('returns versioned tx unchanged when it advances a durable nonce', async () => {
    const payer = Keypair.generate().publicKey
    const nonceAccount = Keypair.generate().publicKey
    const to = Keypair.generate().publicKey

    const vtx = new VersionedTransaction(
      new TransactionMessage({
        payerKey: payer,
        recentBlockhash: 'o'.repeat(32),
        instructions: [
          SystemProgram.nonceAdvance({
            noncePubkey: nonceAccount,
            authorizedPubkey: payer,
          }),
          SystemProgram.transfer({ fromPubkey: payer, toPubkey: to, lamports: 1 }),
        ],
      }).compileToV0Message([])
    )

    const out = await prepareTransactionForBroadcast(vtx)

    expect(out).toBe(vtx)
    expect(hoisted.getLatestBlockhash).not.toHaveBeenCalled()
  })

  it('returns a partially signed legacy transaction unchanged', async () => {
    const payer = Keypair.generate()
    const to = Keypair.generate().publicKey

    const tx = new Transaction({
      feePayer: payer.publicKey,
      recentBlockhash: Keypair.generate().publicKey.toBase58(),
    })
    tx.add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: to,
        lamports: 1,
      })
    )
    tx.sign(payer)

    const out = await prepareTransactionForBroadcast(tx)

    expect(out).toBe(tx)
    expect(hoisted.getLatestBlockhash).not.toHaveBeenCalled()
  })

  it('refreshes v0 message without lookups and prepends compute budget', async () => {
    const payer = Keypair.generate().publicKey
    const to = Keypair.generate().publicKey
    const oldHash = 'o'.repeat(32)
    const newHash = 'n'.repeat(32)

    const vtx = new VersionedTransaction(
      new TransactionMessage({
        payerKey: payer,
        recentBlockhash: oldHash,
        instructions: [
          SystemProgram.transfer({ fromPubkey: payer, toPubkey: to, lamports: 1 }),
        ],
      }).compileToV0Message([])
    )

    hoisted.getLatestBlockhash.mockResolvedValue({
      blockhash: newHash,
      lastValidBlockHeight: 3n,
    })
    hoisted.getDynamicPriorityFeePrice.mockResolvedValue(4_000_000)

    const out = await prepareTransactionForBroadcast(vtx)

    expect(out.message.recentBlockhash).toBe(newHash)
    expect(out.message.version).toBe(0)
    expect(out.message.compiledInstructions.length).toBe(3)

    const ixs = TransactionMessage.decompile(out.message, {
      addressLookupTableAccounts: [],
    }).instructions

    expect(
      ComputeBudgetInstruction.decodeInstructionType(ixs[0]!)
    ).toBe('SetComputeUnitLimit')
    expect(
      ComputeBudgetInstruction.decodeInstructionType(ixs[1]!)
    ).toBe('SetComputeUnitPrice')
    expect(ixs[2]?.programId.equals(SystemProgram.programId)).toBe(true)
  })

  it('keeps RequestHeapFrame while replacing limit/price', async () => {
    const payer = Keypair.generate().publicKey
    const to = Keypair.generate().publicKey

    hoisted.getLatestBlockhash.mockResolvedValue({
      blockhash: 'h'.repeat(32),
      lastValidBlockHeight: 5n,
    })
    hoisted.getDynamicPriorityFeePrice.mockResolvedValue(1_100_000)

    const tx = new Transaction({
      feePayer: payer,
      recentBlockhash: 'a'.repeat(32),
    })
    tx.add(
      ComputeBudgetProgram.requestHeapFrame({ bytes: 256 * 1024 }),
      SystemProgram.transfer({ fromPubkey: payer, toPubkey: to, lamports: 1 })
    )

    const out = await prepareTransactionForBroadcast(tx)

    const kinds = out.instructions.map(ix => {
      if (!ix.programId.equals(ComputeBudgetProgram.programId)) {
        return 'other'
      }
      try {
        return ComputeBudgetInstruction.decodeInstructionType(ix)
      } catch {
        return 'unknown'
      }
    })

    expect(kinds).toEqual([
      'SetComputeUnitLimit',
      'SetComputeUnitPrice',
      'RequestHeapFrame',
      'other',
    ])
  })
})