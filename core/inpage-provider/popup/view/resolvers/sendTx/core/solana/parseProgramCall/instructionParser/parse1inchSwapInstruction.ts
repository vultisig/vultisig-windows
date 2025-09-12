import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { PublicKey } from '@solana/web3.js'
import { TW } from '@trustwallet/wallet-core'

import { ParsedResult } from '../../types/types'
import { readU64LE } from '../../utils'

const oneInchSwapInstructionAccountsIndexes = {
  srcMint: 2,
  dstMint: 7,
  maker: 5,
}

export const parseOneInchSwapInstruction = async (
  instruction: TW.Solana.Proto.RawMessage.IInstruction,
  keys: PublicKey[]
): Promise<ParsedResult> => {
  if (!instruction.accounts || !instruction.programData)
    throw new Error('invalid 1inch instruction')
  const inputAmount = readU64LE(Buffer.from(instruction.programData), 12)
  const outputAmount = readU64LE(Buffer.from(instruction.programData), 20)
  const srcMint =
    keys[
      shouldBePresent(
        instruction.accounts[oneInchSwapInstructionAccountsIndexes.srcMint]
      )
    ]
  const dstMint =
    keys[
      shouldBePresent(
        instruction.accounts[oneInchSwapInstructionAccountsIndexes.dstMint]
      )
    ]
  const maker =
    keys[
      shouldBePresent(
        instruction.accounts[oneInchSwapInstructionAccountsIndexes.maker]
      )
    ]

  return {
    authority: maker.toBase58(),
    inAmount: inputAmount.toString(),
    inputMint: srcMint.toBase58(),
    kind: 'swap',
    outAmount: outputAmount.toString(),
    outputMint: dstMint.toBase58(),
  }
}
