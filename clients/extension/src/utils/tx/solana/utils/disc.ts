import { utf8 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { Buffer } from 'buffer'
import { sha256 } from 'ethers'

export function discHexFor(name: string): string {
  const h = sha256(utf8.encode(`global:${name}`))
  return Buffer.from(h).slice(0, 8).toString('hex')
}

export const first8Hex = (u8: Uint8Array) =>
  Buffer.from(u8).slice(0, 8).toString('hex')
