import { SendTransactionResponse } from '@clients/extension/src/utils/interfaces'
import { Chain } from '@core/chain/Chain'

type GetSignedTxInput<T extends Chain = Chain> = {
  compiledTx: Uint8Array
  chain: T
}

export type GetSignedTxResolver<T extends Chain = Chain> = (
  input: GetSignedTxInput<T>
) => Promise<SendTransactionResponse | string>
