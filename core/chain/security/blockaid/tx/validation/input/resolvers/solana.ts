import { assertField } from '@lib/utils/record/assertField'

import { OtherChain } from '../../../../../../Chain'
import { decodeTx } from '../../../../../../tx/decode'
import { getCompiledTxsForBlockaidInput } from '../../utils/getCompiledTxsForBlockaidInput'
import { BlockaidTxValidationInputResolver } from '../resolver'

export const getSolanaBlockaidTxValidationInput: BlockaidTxValidationInputResolver<
  OtherChain.Solana
> = ({ payload, walletCore, chain }) => {
  const coin = assertField(payload, 'coin')

  const transactions = getCompiledTxsForBlockaidInput({
    payload,
    walletCore,
  }).map(
    tx =>
      decodeTx({
        chain,
        compiledTx: tx,
      }).encoded
  )

  return {
    chain: 'mainnet',
    options: ['validation'],
    account_address: coin.address,
    encoding: 'base58',
    transactions,
    method: 'signAndSendTransaction',
    metadata: {},
  }
}
