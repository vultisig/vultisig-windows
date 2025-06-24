import { OtherChain } from '@core/chain/Chain'
import { attempt } from '@lib/utils/attempt'
import { assertErrorMessage } from '@lib/utils/error/assertErrorMessage'
import { isInError } from '@lib/utils/error/isInError'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { TW } from '@trustwallet/wallet-core'

import { broadcastCardanoTx } from '../../chains/cardano/client/broadcastTx'
import { getCardanoTxHash } from '../../chains/cardano/tx/hash'
import { ExecuteTxResolver } from './ExecuteTxResolver'

export const executeCardanoTx: ExecuteTxResolver<OtherChain.Cardano> = async ({
  walletCore,
  compiledTx,
}) => {
  const output = TW.Cardano.Proto.SigningOutput.decode(compiledTx)

  assertErrorMessage(output.errorMessage)

  const rawTx = stripHexPrefix(walletCore.HexCoding.encode(output.encoded))

  const result = await attempt(broadcastCardanoTx(rawTx))

  if (
    'error' in result &&
    !isInError(
      result.error,
      'BadInputsUTxO',
      'timed out',
      'txn-mempool-conflict',
      'already known'
    )
  ) {
    throw result.error
  }

  const txHash = getCardanoTxHash({
    tx: output.encoded,
    walletCore,
  })

  return { txHash }
}
