import { EvmChain } from '@core/chain/Chain'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW } from '@trustwallet/wallet-core'
import { keccak256 } from 'viem'

import { GetSignedTxResolver } from './getSignedTxResolver'

export const getSignedEvmTx: GetSignedTxResolver<EvmChain> = async ({
  compiledTx,
}) => {
  const { errorMessage, encoded } =
    TW.Ethereum.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(errorMessage)

  const txHash = keccak256(encoded)

  return { raw: encoded, txResponse: txHash }
}
