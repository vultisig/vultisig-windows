import { bech32m } from 'bech32'

export const isBech32mAddress = (address: string): boolean =>
  address.toLowerCase().startsWith('tex1')

export const fromBech32mAddress = (address: string): string => {
  const { words } = bech32m.decode(address.toLowerCase())

  return bech32m.encode('t1', words)
}
