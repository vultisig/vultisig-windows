import { UtxoChain } from '@core/chain/Chain'
import { TW } from '@trustwallet/wallet-core'

import { GetSignedTxResolver } from './getSignedTxResolver'

export const getSignedUtxoTx: GetSignedTxResolver<UtxoChain> = async ({
  compiledTx,
}) => {
  const output = TW.Bitcoin.Proto.SigningOutput.decode(compiledTx)

  return { raw: output.encoded, txResponse: output.transactionId }
}
