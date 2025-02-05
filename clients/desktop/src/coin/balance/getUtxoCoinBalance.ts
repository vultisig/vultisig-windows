import { getUtxoAddressInfo } from '../../chain/utxo/blockchair/getUtxoAddressInfo';
import { UtxoChain } from '../../model/chain';
import { GetCoinBalanceInput } from './GetCoinBalanceInput';

export const getUtxoCoinBalance = async (
  input: GetCoinBalanceInput<UtxoChain>
) => {
  const { data } = await getUtxoAddressInfo(input);

  return BigInt(data[input.address].address.balance);
};
