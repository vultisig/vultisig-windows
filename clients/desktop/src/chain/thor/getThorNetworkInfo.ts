import { Chain } from '@core/chain/Chain';
import { queryUrl } from '@lib/utils/query/queryUrl';

import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl';

interface NetworkInfo {
  native_tx_fee_rune: string;
}

export const getThorNetworkInfo = async () =>
  queryUrl<NetworkInfo>(`${cosmosRpcUrl[Chain.THORChain]}/thorchain/network`);
