import { Coin, CoinKey } from '@core/chain/coin/Coin'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { TW } from '@trustwallet/wallet-core'

import { parseOneInchSwapInstruction } from './instructionParser/parse1inchSwapInstruction'
import { parseTokenInstruction } from './instructionParser/parseTokenInstruction'
import { oneInchSwapProgram } from './swapPrograms'

const parseProgramCall = async (
  tx: TW.Solana.Proto.RawMessage.IMessageLegacy,
  keys: PublicKey[],
  getCoin: (coinKey: CoinKey) => Promise<Coin>
) => {
  if (!tx.instructions || tx.instructions.length === 0)
    throw new Error('Instructions not found')

  for (const instruction of tx.instructions) {
    const program = keys[shouldBePresent(instruction.programId)]
    // parse 1inch swap instruction
    if (program.toBase58() === oneInchSwapProgram) {
      return await parseOneInchSwapInstruction(instruction, keys, getCoin)
    } else if (program.toBase58() === TOKEN_PROGRAM_ID.toBase58()) {
      return await parseTokenInstruction(tx, instruction, keys, getCoin)
    }
  }
  throw new Error('Invalid Solana transaction: no supported instruction found')
}

export default parseProgramCall
