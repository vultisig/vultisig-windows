export const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

// Build the EIP-191 prefixed message as a hex string.
// getCustomMessageHex sees the 0x prefix, decodes to bytes, then keccak256s —
// matching what the verifier does: keccak256("\x19Ethereum Signed Message:\n" + len + msg)
export const toEip191Hex = (message: string): string => {
  const msgBytes = new TextEncoder().encode(message)
  const prefix = `\x19Ethereum Signed Message:\n${msgBytes.length}`
  const prefixBytes = new TextEncoder().encode(prefix)
  const combined = new Uint8Array(prefixBytes.length + msgBytes.length)
  combined.set(prefixBytes)
  combined.set(msgBytes, prefixBytes.length)
  return '0x' + toHex(combined)
}
