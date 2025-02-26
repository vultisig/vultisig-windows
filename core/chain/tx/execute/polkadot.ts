import { getPolkadotClient } from '@core/chain/chains/polkadot/client'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { isInError } from '@lib/utils/error/isInError'
import { TW } from '@trustwallet/wallet-core'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executePolkadotTx: ExecuteTxResolver = async ({
  walletCore,
  compiledTx,
}) => {
  const { errorMessage: polkadotErrorMessage, encoded } =
    TW.Polkadot.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(polkadotErrorMessage)

  const rawTx = walletCore.HexCoding.encode(encoded)

  const rpcClient = await getPolkadotClient()

  try {
    const { hash } = await rpcClient.rpc.author.submitExtrinsic(rawTx)
    return hash.toHex()
  } catch (error) {
    if (isInError(error, 'Transaction is temporarily banned')) {
      const extrinsic = rpcClient.createType('Extrinsic', rawTx, {
        isSigned: true,
        version: 4,
      })
      return extrinsic.hash.toHex()
    }

    throw error
  }
}
