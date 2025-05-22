import { WalletCore } from '@trustwallet/wallet-core'

import { Chain } from '../../Chain'

type ExecuteTxInput<T extends Chain = Chain> = {
  chain: T
  walletCore: WalletCore
  compiledTx: Uint8Array<ArrayBufferLike>
}

export type ExecuteTxResultWithEncoded = { result: string; encoded: string }
export type ExecuteTxResolver<T extends Chain = Chain> = (
  input: ExecuteTxInput<T>
) => Promise<string | ExecuteTxResultWithEncoded>
