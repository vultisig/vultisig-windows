import { GetSignedTxResolver } from '@clients/extension/src/utils/tx/sign/GetSignedTxResolver'
import { UtxoChain } from '@core/chain/Chain'
import { TW } from '@trustwallet/wallet-core'

export const getSignedUtxoTx: GetSignedTxResolver<UtxoChain> = async ({
  compiledTx,
  chain, // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  if (!compiledTx || !(compiledTx instanceof Uint8Array)) {
    throw new Error('Invalid compiledTx: expected non-empty Uint8Array')
  }
  try {
    const output = TW.Bitcoin.Proto.SigningOutput.decode(compiledTx)
    return { raw: output.encoded, txResponse: output.transactionId }
  } catch (error) {
    throw new Error(`Failed to decode UTXO transaction: ${error}`)
  }
}
