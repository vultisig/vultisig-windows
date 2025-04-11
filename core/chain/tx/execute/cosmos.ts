import { CosmosChain } from '@core/chain/Chain'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { attempt } from '@lib/utils/attempt'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { isInError } from '@lib/utils/error/isInError'
import { TW } from '@trustwallet/wallet-core'
import { sha256 } from 'viem'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeCosmosTx: ExecuteTxResolver<CosmosChain> = async ({
  chain,
  compiledTx,
}) => {
  const output = TW.Cosmos.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(output.errorMessage)

  const rawTx = output.serialized
  const parsedData = JSON.parse(rawTx)
  const txBytes = parsedData.tx_bytes
  const decodedTxBytes = Buffer.from(txBytes, 'base64')

  const txHash = sha256(decodedTxBytes).toUpperCase()

  const client = await getCosmosClient(chain)
  const result = attempt(client.broadcastTx(decodedTxBytes))

  if (
    'error' in result &&
    !isInError(result.error, 'tx already exists in cache')
  ) {
    throw result.error
  }

  return txHash
}
