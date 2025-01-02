import { UtxoInfo } from '../../../gen/vultisig/keysign/v1/utxo_info_pb';
import { ChainAccount } from '../../ChainAccount';
import { getUtxoAddressInfo } from '../blockchair/getUtxoAddressInfo';

export const getUtxos = async (account: ChainAccount) => {
  const { data } = await getUtxoAddressInfo(account);

  return data[account.address].utxo.map(
    utxo =>
      new UtxoInfo({
        hash: utxo.transaction_hash,
        amount: BigInt(utxo.value),
        index: Number(utxo.index),
      })
  );
};
