import { UtxoChain } from '@core/chain/Chain'
import { broadcastUtxoTransaction } from '@core/chain/chains/utxo/client/broadcastUtxoTransaction'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { TW } from '@trustwallet/wallet-core'
import { GetSignedTxResolver } from './GetSignedTxResolver'

export const getSignedUtxoTx: GetSignedTxResolver<UtxoChain> = async ({
  compiledTx,
  walletCore,
  chain,
}) => {
  const output = TW.Bitcoin.Proto.SigningOutput.decode(compiledTx)

  return output.transactionId
}
