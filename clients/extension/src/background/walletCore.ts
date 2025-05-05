import { initWasm, WalletCore } from '@trustwallet/wallet-core'

let walletCoreInstance: WalletCore | null = null

export const getWalletCore = async (): Promise<WalletCore> => {
  if (walletCoreInstance) return walletCoreInstance

  walletCoreInstance = await initWasm()
  return walletCoreInstance
}
