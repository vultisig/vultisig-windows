import { GetSignedTxResolver } from '@clients/extension/src/utils/tx/sign/GetSignedTxResolver'
import { EvmChain } from '@core/chain/Chain'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW } from '@trustwallet/wallet-core'
import { keccak256 } from 'viem'

export const getSignedEvmTx: GetSignedTxResolver<EvmChain> = async ({
  compiledTx,
  chain, // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  if (!compiledTx || !(compiledTx instanceof Uint8Array)) {
    throw new Error('Invalid compiledTx: expected non-empty Uint8Array')
  }
  try {
    const { errorMessage, encoded } =
      TW.Ethereum.Proto.SigningOutput.decode(compiledTx)
    assertErrorMessage(errorMessage)
    const txHash = keccak256(encoded)
    return { raw: encoded, txResponse: txHash }
  } catch (error) {
    throw new Error(`Failed to decode EVM transaction: ${error}`)
  }
}
