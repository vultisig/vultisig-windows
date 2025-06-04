import { queryUrl } from '@lib/utils/query/queryUrl'

import { Chain } from '../../../Chain'
import { cosmosRpcUrl } from '../cosmosRpcUrl'

type ChainInfo = {
  address: string
  chain: string
  chain_lp_actions_paused: boolean
  chain_trading_paused: boolean
  dust_threshold: string
  gas_rate: string
  gas_rate_units: string
  global_trading_paused: boolean
  halted: boolean
  observed_fee_rate: string
  outbound_fee: string
  outbound_tx_size: string
  pub_key: string
  router: string
}

const thorchainInboundAddressApi = `${cosmosRpcUrl[Chain.THORChain]}/thorchain/inbound_addresses`

export const getThorchainInboundAddress = (): Promise<ChainInfo[]> =>
  queryUrl(thorchainInboundAddressApi)
