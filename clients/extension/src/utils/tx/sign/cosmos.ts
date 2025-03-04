import { GetSignedTxResolver } from '@clients/extension/src/utils/tx/sign/GetSignedTxResolver'
import { CosmosChain } from '@core/chain/Chain'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW } from '@trustwallet/wallet-core'
import { sha256 } from 'ethers'

export const getSignedCosmosTx: GetSignedTxResolver<CosmosChain> = async ({
  compiledTx,
  chain, // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  if (!compiledTx || !(compiledTx instanceof Uint8Array)) {
    throw new Error('Invalid compiledTx: expected non-empty Uint8Array')
  }
  try {
    const output = TW.Cosmos.Proto.SigningOutput.decode(compiledTx)

    assertErrorMessage(output.errorMessage)

    const rawTx = output.serialized

    const parsedData = JSON.parse(rawTx)
    if (!parsedData.tx_bytes) {
      throw new Error('Missing tx_bytes in the serialized transaction')
    }
    const txBytes = parsedData.tx_bytes
    const decodedTxBytes = Buffer.from(txBytes, 'base64')
    const hash = sha256(decodedTxBytes)
    return { raw: rawTx, txResponse: hash }
  } catch (error) {
    throw new Error(`Failed to process Cosmos transaction: ${error}`)
  }
}
