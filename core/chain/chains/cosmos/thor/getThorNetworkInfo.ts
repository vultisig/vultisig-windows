import { Chain } from '@core/chain/Chain'
import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { queryUrl } from '@lib/utils/query/queryUrl'

interface NetworkInfo {
  native_tx_fee_rune: string
}

export const getThorNetworkInfo = async () =>
  queryUrl<NetworkInfo>(`${cosmosRpcUrl[Chain.THORChain]}/thorchain/network`)
