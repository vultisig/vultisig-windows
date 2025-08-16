import { NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

import { ParserCtx, PartialInstruction } from '../types/types'
import { mintFromTokenAccount } from '../utils'

export async function handleSplTransfer(
  ix: PartialInstruction,
  keys: PublicKey[],
  ctx: ParserCtx
) {
  const pid = keys[ix.programId]
  if (!pid || !pid.equals(TOKEN_PROGRAM_ID)) return null
  const data = Buffer.from(ix.programData)
  if (data[0] !== 12 || data.length < 9) return null // Transfer

  const amount = Number(data.readBigUInt64LE(1))
  const mint = keys[ix.accounts[1]]?.toBase58() ?? NATIVE_MINT.toBase58()
  const auth = keys[ix.accounts[3]]?.toBase58() ?? keys[0]?.toBase58() ?? ''
  const receiverAta = keys[ix.accounts[2]]
  if (!receiverAta) return null

  const info = await ctx.connection.getParsedAccountInfo(receiverAta)
  const owner = (info.value as any)?.data?.parsed?.info?.owner ?? ''
  const recvMint = await mintFromTokenAccount(ctx.connection, receiverAta)
  if (recvMint !== mint) return null

  return {
    kind: 'transfer' as const,
    authority: auth,
    inputMint: mint,
    inAmount: amount,
    receiverAddress: owner,
  }
}
