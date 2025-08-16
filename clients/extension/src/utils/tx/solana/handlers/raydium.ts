import { PublicKey } from '@solana/web3.js'

import { raydiumAmmRouting } from '../config'
import { ParserCtx, PartialInstruction } from '../types/types'
import { mintFromTokenAccount } from '../utils'

export async function handleRaydium(
  ix: PartialInstruction,
  keys: PublicKey[],
  ctx: ParserCtx
) {
  const pid = keys[ix.programId]

  if (!pid || !pid.equals(raydiumAmmRouting)) return null
  const data = Buffer.from(ix.programData)

  if (data[0] !== 0 || data.length < 17) return null // route opcode

  const inputAta = keys[ix.accounts[5]]
  const outputAta = keys[ix.accounts[6]]
  if (!inputAta || !outputAta) return null

  const [inputMint, outputMint] = await Promise.all([
    mintFromTokenAccount(ctx.connection, inputAta),
    mintFromTokenAccount(ctx.connection, outputAta),
  ])
  if (!inputMint || !outputMint) return null

  const inAmount = Number(data.readBigUInt64LE(1))
  const outAmount = Number(data.readBigUInt64LE(9))
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
