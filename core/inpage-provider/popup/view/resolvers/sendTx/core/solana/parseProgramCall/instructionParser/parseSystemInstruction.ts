import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { PublicKey } from '@solana/web3.js'
import { TW } from '@trustwallet/wallet-core'

import { SolanaTxData } from '../../types/types'
import { readU64LE } from '../../utils'

type Input = {
  instruction: TW.Solana.Proto.RawMessage.IInstruction
  keys: PublicKey[]
}
export const parseSystemInstruction = async ({
  instruction,
  keys,
}: Input): Promise<SolanaTxData> => {
  if (!instruction.programData || !instruction.accounts) {
    throw new Error('Program data or accounts are missing.')
  }
  const buf = Buffer.from(instruction.programData)
  const lamports = readU64LE(buf, 4)

  return {
    transfer: {
      authority: keys[instruction.accounts[0]].toBase58(),
      inAmount: lamports.toString(),
      receiverAddress: keys[instruction.accounts[1]].toBase58(),
      inputCoin: chainFeeCoin.Solana,
    },
  }
}
