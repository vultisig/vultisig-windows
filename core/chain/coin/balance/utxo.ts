import { UtxoChain } from '@core/chain/Chain'
import { bigIntSum } from '@lib/utils/bigint/bigIntSum'

import { getUtxos } from '../../chains/utxo/tx/getUtxos'
import { CoinBalanceResolver } from './CoinBalanceResolver'

export const getUtxoCoinBalance: CoinBalanceResolver<
  UtxoChain
> = async input => {
  const utxo = await getUtxos(input)

  return bigIntSum(utxo.map(({ amount }) => amount))
}
