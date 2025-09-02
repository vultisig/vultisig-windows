import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { PublicKey } from '@solana/web3.js'
import { TW } from '@trustwallet/wallet-core'

import { parseOneInchSwapInstruction } from './instructionParser/parse1inchSwapInstruction'
import { oneInchSwapProgram } from './programs'

const parseProgramCall = async (
  tx: TW.Solana.Proto.RawMessage.IMessageLegacy,
  keys: PublicKey[]
) => {
  if (!tx.instructions || tx.instructions.length === 0)
    throw new Error('Instructions not found')

  for (const instruction of tx.instructions) {
    const program = keys[shouldBePresent(instruction.programId)]
    // parse 1inch swap instruction
    if (program.toBase58() === oneInchSwapProgram) {
      return await parseOneInchSwapInstruction(instruction, keys)
    }
  }
}

export default parseProgramCall
