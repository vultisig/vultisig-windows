type Input = {
  publicKey: string
  hexChainCode: string
}

export const getCardanoPublicKeyData = ({ publicKey, hexChainCode }: Input) => {
  const spendingKeyData = Buffer.from(publicKey, 'hex')
  const chainCodeData = Buffer.from(hexChainCode, 'hex')

  const extendedKeyBuffer = Buffer.concat([
    spendingKeyData,
    spendingKeyData,
    chainCodeData,
    chainCodeData,
  ])

  return new Uint8Array(extendedKeyBuffer)
}
