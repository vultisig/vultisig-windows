import { Chain } from '@vultisig/core-chain/Chain'
import { matchDiscriminatedUnion } from '@vultisig/lib-utils/matchDiscriminatedUnion'

import { TransactionRecord } from '../core'

type GetRecordSenderAddressInput = {
  record: TransactionRecord
  /**
   * The current vault's native address per chain. Swap records store no
   * sender, so a swap's is resolved on its source chain through this.
   */
  vaultAddresses: Partial<Record<Chain, string>>
}

/**
 * The address a record's transaction was sent from, for the status lookup:
 * NEAR finds a transaction by its hash and sender together.
 */
export const getRecordSenderAddress = ({
  record,
  vaultAddresses,
}: GetRecordSenderAddressInput): string | undefined =>
  matchDiscriminatedUnion(record, 'type', 'data', {
    send: ({ fromAddress }) => fromAddress,
    swap: ({ fromChain }) => vaultAddresses[fromChain],
    limitSwap: ({ fromAddress }) => fromAddress,
    trustLine: ({ fromAddress }) => fromAddress,
  })
