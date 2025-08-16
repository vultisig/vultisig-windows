import { PublicKey } from '@solana/web3.js'

import { jupiterOrderEngine } from '../config'
import { PartialInstruction } from '../types/types'

export async function handleJupiterOrderEngine(
  ix: PartialInstruction,
  keys: PublicKey[]
) {
  const pid = keys[ix.programId]
  if (!pid || !pid.equals(jupiterOrderEngine)) return null
  const data = Buffer.from(ix.programData)

  const inputMint = keys[ix.accounts[6]].toBase58()

  const outputMint = keys[ix.accounts[8]].toBase58()

  if (!inputMint || !outputMint) return null

  if (!inputMint || !outputMint) return null

  const inAmount = Number(data.readBigUInt64LE(8))
  const outAmount = Number(data.readBigUInt64LE(16))
  const authority = keys[0]?.toBase58() ?? ''

  return {
    kind: 'swap' as const,
    authority,
    inputMint,
    outputMint,
    inAmount,
    outAmount,
  }
}
