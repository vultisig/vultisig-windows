import { getPolkadotClient } from '@core/chain/chains/polkadot/client'
import { attempt } from '@lib/utils/attempt'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { isInError } from '@lib/utils/error/isInError'
import { TW } from '@trustwallet/wallet-core'

import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executePolkadotTx: ExecuteTxResolver = async ({
  walletCore,
  compiledTx,
  skipBroadcast,
}) => {
  const { errorMessage: polkadotErrorMessage, encoded } =
    TW.Polkadot.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(polkadotErrorMessage)

  const rawTx = walletCore.HexCoding.encode(encoded)
  const client = await getPolkadotClient()
  const txHash = client
    .createType('Extrinsic', rawTx, {
      isSigned: true,
      version: 4,
    })
    .hash.toHex()

  console.log('txHash: ', txHash)

  if (skipBroadcast) {
    return { txHash }
  }

  const { error } = await attempt(client.rpc.author.submitExtrinsic(rawTx))
  if (error && !isInError(error, 'Transaction is temporarily banned')) {
    throw error
  }

  return { txHash }
}
