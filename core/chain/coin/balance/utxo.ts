import { UtxoChain } from '@core/chain/Chain'

import { getUtxoAddressInfo } from '../../chains/utxo/client/getUtxoAddressInfo'
import { CoinBalanceResolver } from './CoinBalanceResolver'

export const getUtxoCoinBalance: CoinBalanceResolver<
  UtxoChain
> = async input => {
  const { data } = await getUtxoAddressInfo(input)

  return BigInt(data[input.address].address.balance)
}
