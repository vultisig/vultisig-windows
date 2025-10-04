import { Coin, CoinKey } from '@core/chain/coin/Coin'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { TW } from '@trustwallet/wallet-core'

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

export const parseProgramCall = async ({
  tx,
  keys,
  getCoin,
  swapProvider,
  data,
}: Input) => {
  if (!tx.instructions || tx.instructions.length === 0)
    throw new Error('Instructions not found')

  for (const instruction of tx.instructions) {
    const program = keys[shouldBePresent(instruction.programId)]
    // parse 1inch swap instruction
    if (program.toBase58() === oneInchSwapProgram) {
      return await parseOneInchSwapInstruction({
        instruction,
        keys,
        getCoin,
        swapProvider,
        data,
      })
    } else if (program.toBase58() === TOKEN_PROGRAM_ID.toBase58()) {
      return await parseTokenInstruction({ tx, instruction, keys, getCoin })
    } else if (program.toBase58() === SystemProgram.programId.toBase58()) {
      return await parseSystemInstruction({ instruction, keys })
    }
  }
  throw new Error('Invalid Solana transaction: no supported instruction found')
}
