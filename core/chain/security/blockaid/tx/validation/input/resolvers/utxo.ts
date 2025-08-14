import { UtxoChain } from '@core/chain/Chain'
import { getKeysignCoin } from '@core/mpc/keysign/utils/getKeysignCoin'

import { decodeTx } from '../../../../../../tx/decode'
import { getCompiledTxsForBlockaidInput } from '../../utils/getCompiledTxsForBlockaidInput'
import { BlockaidTxValidationInputResolver } from '../resolver'

export const getUtxoBlockaidTxValidationInput: BlockaidTxValidationInputResolver<
  UtxoChain.Bitcoin
> = ({ payload, walletCore, chain }) => {
  const { address } = getKeysignCoin(payload)

  const [encoded] = getCompiledTxsForBlockaidInput({
    payload,
    walletCore,
  }).map(
    compiledTx =>
      decodeTx({
        chain,
        compiledTx,
      }).encoded
  )

  return {
    chain: chain.toLowerCase(),
    options: ['validation'],
    account_address: address,
    transaction: Buffer.from(encoded).toString('hex'),
    metadata: {},
  }
}
