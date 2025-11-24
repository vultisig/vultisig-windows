import { AccountCoin } from '@core/chain/coin/AccountCoin'

import { CustomTxData } from './customTxData'

export type ParsedTx = {
  thirdPartyGasLimitEstimation?: bigint
  customTxData: CustomTxData
  coin: AccountCoin
  skipBroadcast?: boolean
}
