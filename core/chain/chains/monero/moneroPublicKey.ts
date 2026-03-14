const moneroPublicKeyLength = 32

const isHex = (value: string): boolean =>
  value.length % 2 === 0 && /^[0-9a-f]+$/i.test(value)

export const decodeMoneroPublicKey = (value: string): Uint8Array => {
  const trimmed = value.trim()
  const bytes = isHex(trimmed)
    ? Buffer.from(trimmed, 'hex')
    : Buffer.from(trimmed, 'base64')

  if (bytes.length !== moneroPublicKeyLength) {
    throw new Error('Invalid Monero public key length')
  }

  return new Uint8Array(bytes)
}

export const encodeMoneroPublicKeyHex = (value: string): string =>
  Buffer.from(decodeMoneroPublicKey(value)).toString('hex')
