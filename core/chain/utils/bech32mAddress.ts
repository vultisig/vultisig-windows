import { bech32, bech32m } from 'bech32'
import bs58check from 'bs58check'

export const isBech32mAddress = (address: string): boolean =>
  address.toLowerCase().startsWith('tex1')

export const fromBech32mAddress = (address: string): string => {
  const { words } = bech32m.decode(address.toLowerCase())
  const scriptHash = Buffer.from(bech32.fromWords(words))

  if (scriptHash.length !== 20) {
    throw new Error('Invalid script hash length')
  }

  const versionByte = 0x1c
  const prefixByte = 0xb8
  const payload = Buffer.allocUnsafe(22)
  payload[0] = versionByte
  payload[1] = prefixByte
  scriptHash.copy(payload, 2)

  return bs58check.encode(payload)
}
