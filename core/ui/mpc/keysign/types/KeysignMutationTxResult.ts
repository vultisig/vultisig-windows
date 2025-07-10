import { BlockaidScanResult } from '@core/config/security/blockaid/types'

export type KeysignMutationTxResult = {
  txHash: string
  scanResult?: BlockaidScanResult
  scanUnavailable?: boolean
}
