import { NATIVE_MINT } from '@solana/spl-token'
import { PublicKey, SystemProgram } from '@solana/web3.js'

import { PartialInstruction } from '../types/types'

export async function handleSystemTransfer(
  ix: PartialInstruction,
  keys: PublicKey[]
) {
  const pid = keys[ix.programId]
  if (!pid || !pid.equals(SystemProgram.programId)) return null

  const data = Buffer.from(ix.programData)
  const op = data.readUInt32LE(0)
  if (op !== 2 && op !== 12) return null // Transfer / TransferWithSeed

  const lamports = Number(data.readBigUInt64LE(4))

  const from = keys[ix.accounts[0]]?.toBase58() ?? ''
  const to =
    (op === 2 ? keys[ix.accounts[1]] : keys[ix.accounts[2]])?.toBase58() ?? ''

  return {
    kind: 'transfer' as const,
    authority: from,
    inputMint: NATIVE_MINT.toBase58(),
    inAmount: lamports,
    receiverAddress: to,
  }
}
