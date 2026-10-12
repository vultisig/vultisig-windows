import {
  PublicKey,
  SystemInstruction,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { TW } from '@trustwallet/wallet-core'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { SolanaTxData } from '../../types/types'
import { accountKeyAt } from '../../utils'

type Input = {
  instruction: TW.Solana.Proto.RawMessage.IInstruction
  keys: PublicKey[]
}

/**
 * Decodes a System Program instruction into the approval view's transfer
 * shape. Only a plain `Transfer` is accepted: account creation, allocation
 * and the other system instructions carry a lamport field at the same offset,
 * so reading them as a transfer would show the wrong amount and name the
 * wrong account as the destination. Anything else throws, which sends the
 * caller to the raw review.
 */
export const parseSystemInstruction = async ({
  instruction,
  keys,
}: Input): Promise<SolanaTxData> => {
  const accounts = shouldBePresent(instruction.accounts, 'instruction.accounts')
  const programData = shouldBePresent(
    instruction.programData,
    'instruction.programData'
  )

  const systemInstruction = new TransactionInstruction({
    programId: SystemProgram.programId,
    keys: accounts.map(index => ({
      pubkey: accountKeyAt(keys, index),
      isSigner: false,
      isWritable: false,
    })),
    data: Buffer.from(programData),
  })

  const instructionType =
    SystemInstruction.decodeInstructionType(systemInstruction)
  if (instructionType !== 'Transfer') {
    throw new Error(`Unsupported system instruction: ${instructionType}`)
  }

  const { fromPubkey, toPubkey, lamports } =
    SystemInstruction.decodeTransfer(systemInstruction)

  return {
    transfer: {
      authority: fromPubkey.toBase58(),
      inAmount: lamports.toString(),
      receiverAddress: toPubkey.toBase58(),
      inputCoin: chainFeeCoin.Solana,
    },
  }
}
