import { queryUrl } from '@lib/utils/query/queryUrl';

import { Chain } from '../../model/chain';
import { cosmosTendermintRpcUrl } from '../cosmos/cosmosTendermintRpcUrl';

interface NetworkInfo {
  native_tx_fee_rune: string;
}

export const getThorNetworkInfo = async () =>
  queryUrl<NetworkInfo>(`${cosmosTendermintRpcUrl[Chain.THORChain]}/status`);
