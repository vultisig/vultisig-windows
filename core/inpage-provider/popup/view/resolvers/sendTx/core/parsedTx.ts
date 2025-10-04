import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { FeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'

import { CustomTxData } from './customTxData'

export type ParsedTx = {
  feeSettings: FeeSettings | null
  customTxData: CustomTxData
  coin: AccountCoin
  skipBroadcast?: boolean
}
