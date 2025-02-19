import { CosmosChain } from '@core/chain/Chain'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW } from '@trustwallet/wallet-core'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeCosmosTx: ExecuteTxResolver<CosmosChain> = async ({
  chain,
  walletCore, // eslint-disable-line @typescript-eslint/no-unused-vars
  compiledTx,
}) => {
  const output = TW.Cosmos.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(output.errorMessage)

  const rawTx = output.serialized
  const parsedData = JSON.parse(rawTx)
  const txBytes = parsedData.tx_bytes
  const decodedTxBytes = Buffer.from(txBytes, 'base64')

  const client = await getCosmosClient(chain)
  const { transactionHash } = await client.broadcastTx(decodedTxBytes)

  return transactionHash
}
