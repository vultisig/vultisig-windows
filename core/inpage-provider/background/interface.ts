import { VaultAppSession } from '@core/extension/storage/appSessions'
import { KeplrSuggestedChainsRecord } from '@core/extension/storage/keplrSuggestedChains'
import { VaultExport } from '@core/ui/vault/export/core'
import { ChainInfo } from '@keplr-wallet/types'
import { Chain, CosmosChain, OtherChain } from '@vultisig/core-chain/Chain'
import { ChainOfKind } from '@vultisig/core-chain/ChainKind'
import { CoinKey, CoinMetadata, Token } from '@vultisig/core-chain/coin/Coin'
import { ChainWithTokenMetadataDiscovery } from '@vultisig/core-chain/coin/token/metadata/chains'
import { Method } from '@vultisig/lib-utils/types/Method'

import { ActiveChainKind } from '../chain'

type GetAppChainMethod<K extends ActiveChainKind = ActiveChainKind> = Method<
  { chainKind: K },
  ChainOfKind<K>
>

export type SetAppChainInput = {
  [K in ActiveChainKind]: { [P in K]: ChainOfKind<P> }
}[ActiveChainKind]

export type GetAccountInput = {
  chain: Chain
  /** When provided (e.g. from grantVaultAccess popup response), used instead of storage lookup to avoid races. */
  appSession?: VaultAppSession
}

type BroadcastTxChain = CosmosChain | OtherChain.QBTC

export type BackgroundInterface = {
  getAppChainId: Method<{ chainKind: ActiveChainKind }, string>
  setAppChain: Method<SetAppChainInput>
  getAppChain: GetAppChainMethod
  setVaultChain: Method<SetAppChainInput>
  getAccount: Method<GetAccountInput, { address: string; publicKey: string }>
  signOut: Method<{}>
  hasAppSession: Method<{}, boolean>
  evmClientRequest: Method<{ method: string; params?: unknown[] }, unknown>
  exportVault: Method<{}, VaultExport>
  getTx: Method<{ chain: Chain; hash: string }, unknown>
  broadcastTx: Method<
    { chain: BroadcastTxChain; txBytes: string },
    { txHash: string }
  >
  suiBuildTransaction: Method<
    { transactionJson: string; sender: string },
    { transactionBytes: string }
  >
  suiExecuteTransaction: Method<
    { transactionBytes: string; signature: string },
    unknown
  >
  getTokenMetadata: Method<
    Token<CoinKey<ChainWithTokenMetadataDiscovery>>,
    CoinMetadata
  >
  getIsWalletPrioritized: Method<{}, boolean>
  hasChainInVault: Method<{ chain: Chain }, boolean>
  getKeplrSuggestedChains: Method<{}, KeplrSuggestedChainsRecord>
  addKeplrSuggestedChain: Method<{ chainInfo: ChainInfo }>
}

export type BackgroundMethod = keyof BackgroundInterface

export const authorizedBackgroundMethods = [
  'getAccount',
  'setAppChain',
  'setVaultChain',
  'exportVault',
] as const satisfies readonly BackgroundMethod[]

export type AuthorizedBackgroundMethod =
  (typeof authorizedBackgroundMethods)[number]
