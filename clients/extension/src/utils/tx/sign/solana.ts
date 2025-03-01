import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW } from '@trustwallet/wallet-core'

import { GetSignedTxResolver } from './getSignedTxResolver'

export const getSignedSolanaTx: GetSignedTxResolver = async ({
  compiledTx,
}) => {
  const {
    encoded,
    signatures,
    errorMessage: solanaErrorMessage,
  } = TW.Solana.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(solanaErrorMessage)

  return { raw: encoded, txResponse: signatures[0].signature! }
}
