import { queryUrl } from '../../../lib/utils/query/queryUrl';
import { Endpoint } from '../../../services/Endpoint';

type BlockchairStatsResponse = {
  data: {
    suggested_transaction_fee_per_byte_sat: number;
  };
};

export const getUtxoStats = (chainName: string) => {
  const chain = chainName.toLowerCase();
  const url = `${Endpoint.vultisigApiProxy}/blockchair/${chain}/stats`;

  return queryUrl<BlockchairStatsResponse>(url);
};
