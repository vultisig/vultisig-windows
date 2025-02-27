import { getSolanaClient } from '@core/chain/chains/solana/client'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'

import { TW } from '@trustwallet/wallet-core'
import { GetSignedTxResolver } from './GetSignedTxResolver'


export const getSignedSolanaTx: GetSignedTxResolver = async ({ compiledTx }) => {
  const { encoded, errorMessage: solanaErrorMessage } =
    TW.Solana.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(solanaErrorMessage)

  const client = getSolanaClient()


  return ""
}
