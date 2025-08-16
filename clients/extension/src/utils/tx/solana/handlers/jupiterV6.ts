import { BorshCoder } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'

import { jupiterV6ProgramId } from '../config'
import { IDL as JUP_IDL } from '../idl/jupiter'
import { ParserCtx, PartialInstruction } from '../types/types'
import { mapAccountsByName, mintFromTokenAccount } from '../utils'
import { discHexFor, first8Hex } from '../utils/disc'

const routeDiscs = new Set([
  discHexFor('route'),
  discHexFor('routeWithTokenLedger'),
  discHexFor('sharedAccountsRoute'),
  discHexFor('sharedAccountsRouteWithTokenLedger'),
  discHexFor('sharedAccountsExactOutRoute'),
  discHexFor('exactOutRoute'),
])

const coder = new BorshCoder(JUP_IDL)

export async function handleJupiter(
  ix: PartialInstruction,
  keys: PublicKey[],
  ctx: ParserCtx
) {
  // program gate
  const pid = keys[ix.programId]
  if (!pid || !pid.equals(jupiterV6ProgramId)) return null
  // discriminator gate
  if (!routeDiscs.has(first8Hex(ix.programData))) return null

  const decoded = coder.instruction.decode(Buffer.from(ix.programData))
  if (!decoded) return null
  const ins = JUP_IDL.instructions.find(i => i.name === decoded.name)
  if (!ins) return null

  const byName = mapAccountsByName(ins as any, ix, keys)
  const getPublicKey = (n: string) => {
    const i = byName.get(n)
    return i != null && i >= 0 ? keys[i] : undefined
  }

  // amounts
  const inAmount = Number((decoded.data as any).inAmount?.toString?.() ?? 0)
  const outAmount = Number(
    (decoded.data as any).quotedOutAmount?.toString?.() ?? 0
  )

  const authority =
    getPublicKey('userTransferAuthority')?.toBase58() ??
    keys[0]?.toBase58() ??
    ''

  // output mint prefer explicit then derive from token account(s)
  let outputMint = getPublicKey('destinationMint')?.toBase58()
  if (!outputMint) {
    for (const n of [
      'destinationTokenAccount',
      'programDestinationTokenAccount',
    ]) {
      const ata = getPublicKey(n)
      if (!ata) continue
      const mint = await mintFromTokenAccount(ctx.connection, ata)
      if (mint) {
        outputMint = mint
        break
      }
    }
  }

  // input mint prefer explicit then token account(s)
  let inputMint = getPublicKey('sourceMint')?.toBase58()
  if (!inputMint) {
    for (const n of [
      'sourceTokenAccount',
      'userSourceTokenAccount',
      'programSourceTokenAccount',
    ]) {
      const ata = getPublicKey(n)
      if (!ata) continue
      const mint = await mintFromTokenAccount(ctx.connection, ata)
      if (mint) {
        inputMint = mint
        break
      }
    }
  }

  if (!inputMint || !outputMint) return null
  return {
    kind: 'swap' as const,
    authority,
    inputMint,
    outputMint,
    inAmount,
    outAmount,
  }
}
