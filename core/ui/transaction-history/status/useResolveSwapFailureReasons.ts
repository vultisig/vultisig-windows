import { useUpdateTransactionRecordMutation } from '@core/ui/storage/transactionHistory'
import { EvmChain } from '@vultisig/core-chain/Chain'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { useEffect, useRef } from 'react'

import { SwapTransactionRecord, TransactionRecord } from '../core'
import { getEvmTxRevert } from './getEvmTxRevert'
import { getSwapFailureReason } from './swapFailureReason'

const evmChains = Object.values(EvmChain)

// Reading a revert means replaying the transaction against the block it was
// mined in, so a record is only worth asking about while a node still holds
// state for that block. The window bounds the backlog rather than the answer.
const revertLookupWindowMs = 7 * 24 * 60 * 60 * 1000

const isUnexplainedEvmSwapFailure = (
  record: TransactionRecord
): record is SwapTransactionRecord & { chain: EvmChain } =>
  record.type === 'swap' &&
  record.status === 'failed' &&
  record.data.failureReason === undefined &&
  isOneOf(record.chain, evmChains) &&
  Date.now() - new Date(record.timestamp).getTime() < revertLookupWindowMs

/**
 * Asks the chain, once per history open, why each recently failed EVM swap
 * reverted, and stores the reason on the record when it recognises one.
 *
 * A receipt cannot tell a swap that reverted because the price moved past the
 * signed minimum from any other failure, so without this the row reads as a
 * generic failure — and the natural response is to retry at the same slippage
 * and pay the fee again.
 *
 * Each record is asked about once per mount: the answer cannot change, and the
 * records refetch that every write triggers must not re-poll the backlog.
 */
export const useResolveSwapFailureReasons = (records: TransactionRecord[]) => {
  const { mutate: updateRecord } = useUpdateTransactionRecordMutation()
  const checkedIdsRef = useRef(new Set<string>())

  useEffect(() => {
    const candidates = records
      .filter(isUnexplainedEvmSwapFailure)
      .filter(record => !checkedIdsRef.current.has(record.id))

    if (candidates.length === 0) return

    candidates.forEach(record => checkedIdsRef.current.add(record.id))

    candidates.forEach(async record => {
      const revert = await getEvmTxRevert({
        chain: record.chain,
        txHash: record.txHash,
      })
      if (!revert) return

      const failureReason = getSwapFailureReason(revert)
      if (!failureReason) return

      updateRecord({ ...record, data: { ...record.data, failureReason } })
    })
  }, [records, updateRecord])
}
