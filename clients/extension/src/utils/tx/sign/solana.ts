import { GetSignedTxResolver } from '@clients/extension/src/utils/tx/sign/GetSignedTxResolver'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW } from '@trustwallet/wallet-core'

export const getSignedSolanaTx: GetSignedTxResolver = async ({
  compiledTx,
  chain, // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  try {
    const {
      encoded,
      signatures,
      errorMessage: solanaErrorMessage,
    } = TW.Solana.Proto.SigningOutput.decode(compiledTx)

    assertErrorMessage(solanaErrorMessage)
    if (!signatures.length || !signatures[0].signature) {
      throw new Error(
        'No valid signature found in the Solana transaction output'
      )
    }
    return { raw: encoded, txResponse: signatures[0].signature }
  } catch (error) {
    throw new Error(`Failed to decode Solana transaction: ${String(error)}`)
  }
}
