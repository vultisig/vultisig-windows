import type { Chain } from '@core/chain/Chain'
import type { PublicKeys } from '@core/chain/publicKey/PublicKeys'
import type { WalletCore } from '@trustwallet/wallet-core'

type WalletContextVault = {
  hexChainCode: string
  publicKeys: PublicKeys
  chainPublicKeys?: Partial<Record<Chain, string>>
}

type WalletContext = {
  walletCore: WalletCore
  vault: WalletContextVault
}

let context: WalletContext | null = null

export const setWalletContext = (ctx: WalletContext | null) => {
  context = ctx
}

export const getWalletContext = (): WalletContext => {
  if (!context) throw new Error('Wallet context not initialized')
  return context
}
