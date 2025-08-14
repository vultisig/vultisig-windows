import { assertField } from '@lib/utils/record/assertField'

import { OtherChain } from '../../../../../../Chain'
import { decodeTx } from '../../../../../../tx/decode'
import { getCompiledTxsForBlockaidInput } from '../../utils/getCompiledTxsForBlockaidInput'
import { BlockaidTxValidationInputResolver } from '../resolver'

export const getSuiBlockaidTxValidationInput: BlockaidTxValidationInputResolver<
  OtherChain.Sui
> = ({ payload, walletCore }) => {
  const coin = assertField(payload, 'coin')

  const compiledTxs = getCompiledTxsForBlockaidInput({
    payload,
    walletCore,
  })

  const [transaction] = compiledTxs.map(
    compiledTx =>
      decodeTx({
        chain: OtherChain.Sui,
        compiledTx,
      }).unsignedTx
  )

  return {
    chain: 'mainnet',
    options: ['validation'],
    account_address: coin.address,
    transaction,
    metadata: {},
  }
}
