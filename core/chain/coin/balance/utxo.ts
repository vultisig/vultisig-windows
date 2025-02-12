import { getUtxoAddressInfo } from '../../chain/utxo/blockchair/getUtxoAddressInfo';
import { UtxoChain } from '@core/chain/Chain';
import { CoinBalanceResolver } from './CoinBalanceResolver';

export const getUtxoCoinBalance: CoinBalanceResolver<
  UtxoChain
> = async input => {
  const { data } = await getUtxoAddressInfo(input);

  return BigInt(data[input.address].address.balance);
};
