import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { SingingMode } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { CustomTxData } from './customTxData'

export type ParsedTx = {
  thirdPartyGasLimitEstimation?: bigint
  customTxData: CustomTxData
  coin: AccountCoin
  skipBroadcast?: boolean
  signingMode?: SingingMode
}
