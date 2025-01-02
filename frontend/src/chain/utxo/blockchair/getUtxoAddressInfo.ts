import { queryUrl } from '../../../lib/utils/query/queryUrl';
import { Endpoint } from '../../../services/Endpoint';
import { ChainAccount } from '../../ChainAccount';

type BlockchairAddressResponse = {
  data: {
    [address: string]: {
      address: {
        balance: number;
      };
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

export const getUtxoAddressInfo = ({ address, chain }: ChainAccount) => {
  const coinName = chain.toLowerCase();

  const url = `${Endpoint.vultisigApiProxy}/blockchair/${coinName}/dashboards/address/${address}?state=latest`;

  return queryUrl<BlockchairAddressResponse>(url);
};
