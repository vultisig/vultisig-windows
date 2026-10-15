import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { describe, expect, it } from 'vitest'

import { parseSystemInstruction } from './parseSystemInstruction'

const sender = new PublicKey(new Uint8Array(32).fill(1))
const recipient = new PublicKey(new Uint8Array(32).fill(2))
const keys = [sender, recipient, SystemProgram.programId]

const compile = (instruction: TransactionInstruction) => ({
  programId: keys.findIndex(key => key.equals(instruction.programId)),
  accounts: instruction.keys.map(({ pubkey }) =>
    keys.findIndex(key => key.equals(pubkey))
  ),
  programData: new Uint8Array(instruction.data),
})

describe('parseSystemInstruction', () => {
  it('decodes a transfer into its amount and destination', async () => {
    const instruction = compile(
      SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: recipient,
        lamports: 10_000_000,
      })
    )

    await expect(
      parseSystemInstruction({ instruction, keys })
    ).resolves.toEqual({
      transfer: {
        authority: sender.toBase58(),
        receiverAddress: recipient.toBase58(),
        inAmount: '10000000',
        inputCoin: expect.objectContaining({ chain: 'Solana' }),
      },
    })
  })

  it('rejects a system instruction that is not a transfer', async () => {
    const instruction = compile(
      SystemProgram.createAccount({
        fromPubkey: sender,
        newAccountPubkey: recipient,
        lamports: 10_000_000,
        space: 0,
        programId: SystemProgram.programId,
      })
    )

    await expect(parseSystemInstruction({ instruction, keys })).rejects.toThrow(
      'Unsupported system instruction: Create'
    )
  })

  it('fails closed when an account index is outside the resolved keys', async () => {
    const instruction = {
      ...compile(
        SystemProgram.transfer({
          fromPubkey: sender,
          toPubkey: recipient,
          lamports: 1,
        })
      ),
      accounts: [0, 9],
    }

    await expect(
      parseSystemInstruction({ instruction, keys })
    ).rejects.toThrow()
  })
})
