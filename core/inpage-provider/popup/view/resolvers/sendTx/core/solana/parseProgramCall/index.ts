import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { ComputeBudgetProgram, PublicKey, SystemProgram } from '@solana/web3.js'
import { TW } from '@trustwallet/wallet-core'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { Coin, CoinKey } from '@vultisig/core-chain/coin/Coin'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { SolanaTxData } from '../types/types'
import { accountKeyAt } from '../utils'
import { parseOneInchSwapInstruction } from './instructionParser/parse1inchSwapInstruction'
import { parseSystemInstruction } from './instructionParser/parseSystemInstruction'
import { parseTokenInstruction } from './instructionParser/parseTokenInstruction'
import { oneInchSwapProgram } from './swapPrograms'

type Input = {
  tx: TW.Solana.Proto.RawMessage.IMessageLegacy
  keys: PublicKey[]
  getCoin: (coinKey: CoinKey) => Promise<Coin>
  swapProvider: string
  data: string
}

const tokenProgram = TOKEN_PROGRAM_ID.toBase58()
const systemProgram = SystemProgram.programId.toBase58()

// Programs whose instructions ride along with a transfer without moving
// anything else: priority-fee settings, memos, and the associated token
// account an SPL recipient may still need.
const transferCompanionPrograms = new Set([
  ComputeBudgetProgram.programId.toBase58(),
  ASSOCIATED_TOKEN_PROGRAM_ID.toBase58(),
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
  'Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo',
])

const getRawFallback = (data: string): SolanaTxData => ({
  raw: {
    inAmount: '0',
    inputCoin: chainFeeCoin.Solana,
    transactions: [data],
  },
})

/**
 * Classifies a decoded Solana transaction by its program calls. A swap is
 * recognised from its swap instruction; a transfer is reported only when every
 * other instruction is a known companion, since the summary would otherwise
 * omit whatever the rest of the transaction moves. Anything else lands in the
 * raw review.
 */
export const parseProgramCall = async ({
  tx,
  keys,
  getCoin,
  swapProvider,
  data,
}: Input) => {
  const instructions = tx.instructions ?? []
  if (instructions.length === 0) throw new Error('Instructions not found')

  const programOf = (instruction: TW.Solana.Proto.RawMessage.IInstruction) =>
    accountKeyAt(keys, shouldBePresent(instruction.programId)).toBase58()

  for (const instruction of instructions) {
    const program = programOf(instruction)
    if (program === oneInchSwapProgram) {
      return await parseOneInchSwapInstruction({
        instruction,
        keys,
        getCoin,
        swapProvider,
        data,
      })
    }

    if (program !== tokenProgram && program !== systemProgram) continue

    const hasOnlyCompanions = instructions.every(
      other =>
        other === instruction || transferCompanionPrograms.has(programOf(other))
    )
    if (!hasOnlyCompanions) {
      console.error(
        'transfer shares the transaction with other instructions, returning raw fallback'
      )
      return getRawFallback(data)
    }

    return program === tokenProgram
      ? await parseTokenInstruction({ tx, instruction, keys, getCoin })
      : await parseSystemInstruction({ instruction, keys })
  }

  console.error('could not parse transaction, returning raw fallback')
  return getRawFallback(data)
}
