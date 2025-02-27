import { CosmosChain } from '@core/chain/Chain'
import { getCosmosClient } from '@core/chain/chains/cosmos/client'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW } from '@trustwallet/wallet-core'
import { GetSignedTxResolver } from './GetSignedTxResolver'
import { sha256 } from 'ethers'

export const getSignedCosmosTx: GetSignedTxResolver<CosmosChain> = async ({
  chain, // eslint-disable-line @typescript-eslint/no-unused-vars
  walletCore, // eslint-disable-line @typescript-eslint/no-unused-vars
  compiledTx,
}) => {
  const output = TW.Cosmos.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(output.errorMessage)

  const rawTx = output.serialized
  const parsedData = JSON.parse(rawTx)
  const txBytes = parsedData.tx_bytes
  const decodedTxBytes = Buffer.from(txBytes, 'base64')
  const hash = sha256(decodedTxBytes)

  return hash
}
