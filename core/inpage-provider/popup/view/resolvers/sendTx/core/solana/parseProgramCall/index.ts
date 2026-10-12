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
  senderAddress: string
  getCoin: (coinKey: CoinKey) => Promise<Coin>
  swapProvider: string
  data: string
}

type Instruction = TW.Solana.Proto.RawMessage.IInstruction

const tokenProgram = TOKEN_PROGRAM_ID.toBase58()
const systemProgram = SystemProgram.programId.toBase58()
const associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID.toBase58()
const ataPayerAccountIndex = 0
// `Create` is sent with no data by older clients and as a single 0 byte by
// newer ones; `CreateIdempotent` is a single 1. Anything longer or different
// (`RecoverNested` moves tokens and closes an account) is not a creation.
const ataCreateInstructionTypes = new Set([0, 1])
const isAtaCreation = (programData: Uint8Array) =>
  programData.length === 0 ||
  (programData.length === 1 && ataCreateInstructionTypes.has(programData[0]))

// Programs whose instructions never move the sender's funds: priority-fee
// settings and memos.
const movementFreePrograms = new Set([
  ComputeBudgetProgram.programId.toBase58(),
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
 * other instruction is a companion that moves none of the sender's funds,
 * since the summary would otherwise omit whatever the rest of the transaction
 * moves. Creating an associated token account counts only when the
 * instruction really is a creation and someone else pays for it: the
 * rent-exempt deposit lands in an account its owner can close to reclaim it,
 * so a vault-funded creation is a SOL movement the transfer card would hide.
 * Anything else lands in the raw review.
 */
export const parseProgramCall = async ({
  tx,
  keys,
  senderAddress,
  getCoin,
  swapProvider,
  data,
}: Input) => {
  const instructions = tx.instructions ?? []
  if (instructions.length === 0) throw new Error('Instructions not found')

  const programOf = (instruction: Instruction) =>
    accountKeyAt(keys, shouldBePresent(instruction.programId)).toBase58()

  const isTransferCompanion = (instruction: Instruction) => {
    const program = programOf(instruction)
    if (movementFreePrograms.has(program)) return true
    if (program !== associatedTokenProgram) return false

    const programData = shouldBePresent(
      instruction.programData,
      'instruction.programData'
    )
    if (!isAtaCreation(programData)) return false

    const accounts = shouldBePresent(
      instruction.accounts,
      'instruction.accounts'
    )
    const payer = accountKeyAt(
      keys,
      shouldBePresent(accounts[ataPayerAccountIndex])
    ).toBase58()
    return payer !== senderAddress
  }

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
      other => other === instruction || isTransferCompanion(other)
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
