import { Chain } from '@core/chain/Chain'
import { WalletCore } from '@trustwallet/wallet-core'

type GetSignedTxInput<T extends Chain = Chain> = {
  chain: T
  walletCore: WalletCore
  compiledTx: Uint8Array<ArrayBufferLike>
}

export type GetSignedTxResolver<T extends Chain = Chain> = (
  input: GetSignedTxInput<T>
) => Promise<string>
