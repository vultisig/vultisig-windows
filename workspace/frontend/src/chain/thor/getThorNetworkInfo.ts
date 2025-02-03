import { queryUrl } from '../../lib/utils/query/queryUrl';
import { Endpoint } from '../../services/Endpoint';

interface NetworkInfo {
  native_tx_fee_rune: string;
}

export const getThorNetworkInfo = async () =>
  queryUrl<NetworkInfo>(Endpoint.fetchThorchainNetworkInfoNineRealms);
