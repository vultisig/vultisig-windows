import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { FeeSettings } from '@core/chain/feeQuote/settings/core'

import { CustomTxData } from './customTxData'

export type ParsedTx = {
  feeSettings: FeeSettings | null
  customTxData: CustomTxData
  coin: AccountCoin
  skipBroadcast?: boolean
}
