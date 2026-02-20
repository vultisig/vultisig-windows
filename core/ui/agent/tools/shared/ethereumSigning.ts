import { keccak256, toBytes } from 'viem'

export function ethereumSignHash(message: string): string {
  const prefixed = `\x19Ethereum Signed Message:\n${message.length}${message}`
  const hash = keccak256(toBytes(prefixed))
  return hash.slice(2)
}
