const loadMoneroTs = async (): Promise<any> => {
  const mod = await import('monero-ts')
  const moneroTs = mod.default || mod
  moneroTs.LibraryUtils.setWorkerDistPath('/libs/monero-ts/monero.worker.js')
  return moneroTs
}

export const isValidMoneroMnemonic = async (
  mnemonic: string
): Promise<boolean> => {
  try {
    const moneroTs = await loadMoneroTs()
    await moneroTs.MoneroUtils.validateMnemonic(mnemonic)
    return true
  } catch {
    return false
  }
}

export const moneroMnemonicToSpendKey = async (
  mnemonic: string
): Promise<Uint8Array> => {
  const moneroTs = await loadMoneroTs()
  const wallet = await moneroTs.createWalletKeys({
    networkType: moneroTs.MoneroNetworkType.MAINNET,
    seed: mnemonic,
  })

  try {
    const spendKeyHex = await wallet.getPrivateSpendKey()
    return new Uint8Array(Buffer.from(spendKeyHex, 'hex'))
  } finally {
    await wallet.close().catch(() => {})
  }
}
