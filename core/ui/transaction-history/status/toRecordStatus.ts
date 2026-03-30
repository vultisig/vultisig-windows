import { TxStatusResult } from '@vultisig/core-chain/tx/status/resolver'

import { TransactionRecordStatus } from '../core'

/** Maps a chain-level tx status result to a transaction record status. */
export const toRecordStatus: Record<
  TxStatusResult['status'],
  TransactionRecordStatus
> = {
  pending: 'pending',
  success: 'confirmed',
  error: 'failed',
}
