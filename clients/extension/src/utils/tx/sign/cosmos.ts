import { CosmosChain } from '@core/chain/Chain'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW } from '@trustwallet/wallet-core'
import { sha256 } from 'ethers'

import { GetSignedTxResolver } from './getSignedTxResolver'

export const getSignedCosmosTx: GetSignedTxResolver<CosmosChain> = async ({
  compiledTx,
}) => {
  const output = TW.Cosmos.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(output.errorMessage)

  const rawTx = output.serialized
  const parsedData = JSON.parse(rawTx)
  const txBytes = parsedData.tx_bytes
  const decodedTxBytes = Buffer.from(txBytes, 'base64')
  const hash = sha256(decodedTxBytes)

  return { raw: rawTx, txResponse: hash }
}
