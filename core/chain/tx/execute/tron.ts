import { OtherChain } from '@core/chain/Chain'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { TW } from '@trustwallet/wallet-core'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeTronTx: ExecuteTxResolver<OtherChain> = async ({
  chain,
  walletCore, // eslint-disable-line @typescript-eslint/no-unused-vars
  compiledTx,
}) => {
  const output = TW.Tron.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(output.errorMessage)

  const rawTx = output.json

  console.log('rawTx', rawTx)

  return rawTx
}
