import { UtxoChain } from '@core/chain/Chain'
import { getUtxos } from '@core/chain/chains/utxo/tx/getUtxos'
import { bigIntSum } from '@lib/utils/bigint/bigIntSum'

import { CoinBalanceResolver } from '../resolver'

export const getUtxoCoinBalance: CoinBalanceResolver<
  UtxoChain
> = async input => {
  const utxo = await getUtxos(input)

  return bigIntSum(utxo.map(({ amount }) => amount))
}
