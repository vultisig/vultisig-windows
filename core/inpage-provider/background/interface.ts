import { Chain } from '@core/chain/Chain'
import { ChainOfKind } from '@core/chain/ChainKind'
import { CoinKey, CoinMetadata, Token } from '@core/chain/coin/Coin'
import { ChainWithTokenMetadataDiscovery } from '@core/chain/coin/token/metadata/chains'
import { VaultExport } from '@core/ui/vault/export/core'
import { Method } from '@lib/utils/types/Method'

import { ActiveChainKind } from '../chain'

type GetAppChainMethod<K extends ActiveChainKind = ActiveChainKind> = Method<
  { chainKind: K },
  ChainOfKind<K>
>

export type SetAppChainInput = {
  [K in ActiveChainKind]: { [P in K]: ChainOfKind<P> }
}[ActiveChainKind]

export type BackgroundInterface = {
  getAppChainId: Method<{ chainKind: ActiveChainKind }, string>
  setAppChain: Method<SetAppChainInput>
  getAppChain: GetAppChainMethod
  setVaultChain: Method<SetAppChainInput>
  getAccount: Method<{ chain: Chain }, { address: string; publicKey: string }>
  signOut: Method<{}>
  evmClientRequest: Method<{ method: string; params?: unknown[] }, unknown>
  exportVault: Method<{}, VaultExport>
  getTx: Method<{ chain: Chain; hash: string }, unknown>
  getTokenMetadata: Method<
    Token<CoinKey<ChainWithTokenMetadataDiscovery>>,
    CoinMetadata
  >
  getIsWalletPrioritized: Method<{}, boolean>
}

export type BackgroundMethod = keyof BackgroundInterface

export const authorizedBackgroundMethods = [
  'getAccount',
  'setAppChain',
  'exportVault',
] as const satisfies readonly BackgroundMethod[]

export type AuthorizedBackgroundMethod =
  (typeof authorizedBackgroundMethods)[number]
