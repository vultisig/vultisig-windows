import { TxResult } from '@core/chain/tx/execute/ExecuteTxResolver'
import { ScanResponse } from '@core/config/security/blockaid/types'

export type KeysignMutationTxResult = TxResult & {
  scanResult?: ScanResponse
  scanUnavailable?: boolean
}
