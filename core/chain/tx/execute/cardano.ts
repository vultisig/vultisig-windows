import { Serialization } from '@cardano-sdk/core'
import { Chain, OtherChain } from '@core/chain/Chain'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW } from '@trustwallet/wallet-core'

import { broadcastUtxoTransaction } from '../../chains/utxo/client/broadcastUtxoTransaction'
import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeCardanoTx: ExecuteTxResolver<OtherChain.Cardano> = async ({
  compiledTx,
  skipBroadcast,
}) => {
  const output = TW.Cardano.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(output.errorMessage)
  if (skipBroadcast) return { txHash: output.txId }
  const rawTx = Buffer.from(output.encoded).toString('hex')

  await broadcastUtxoTransaction({ chain: Chain.Cardano, tx: rawTx })

  const txHash = Serialization.Transaction.fromCbor(
    Serialization.TxCBOR(rawTx)
  ).getId()

  return { txHash }
}
