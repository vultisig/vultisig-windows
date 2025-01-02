import { UtxoInfo } from '../../../gen/vultisig/keysign/v1/utxo_info_pb';
import { queryUrl } from '../../../lib/utils/query/queryUrl';
import { Endpoint } from '../../../services/Endpoint';
import { ChainAccount } from '../../ChainAccount';

type BlockchairAddressResponse = {
  data: {
    [address: string]: {
      utxo: {
        block_id: number;
        transaction_hash: string;
        index: number;
        value: number;
        value_usd: number;
        recipient: string;
        script_hex: string;
        is_from_coinbase: boolean;
        is_spendable: boolean;
      }[];
    };
  };
};

export const getUtxos = async ({ chain, address }: ChainAccount) => {
  const coinName = chain.toLowerCase();
  const url = Endpoint.blockchairDashboard(address, coinName);
  const { data } = await queryUrl<BlockchairAddressResponse>(url);

  return data[address].utxo.map(
    utxo =>
      new UtxoInfo({
        hash: utxo.transaction_hash,
        amount: BigInt(utxo.value),
        index: Number(utxo.index),
      })
  );
};
