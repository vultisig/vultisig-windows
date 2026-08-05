import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import {
  KeysignMutationListenerProvider,
  useKeysignMutationListener,
} from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import {
  useSaveTransactionRecordMutation,
  useTransactionRecordsQuery,
  useUpdateTransactionRecordMutation,
} from '@core/ui/storage/transactionHistory'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'
import { useQueryClient } from '@tanstack/react-query'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { getKeysignCoin } from '@vultisig/core-mpc/keysign/utils/getKeysignCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { useKeysignMessagePayload } from '../../mpc/keysign/state/keysignMessagePayload'
import { applyLimitOrderCancel } from './applyLimitOrderCancel'
import { createTransactionRecord } from './createTransactionRecord'

export const TransactionRecorderProvider = ({ children }: ChildrenProp) => {
  const parentListener = useKeysignMutationListener()
  const payload = useKeysignMessagePayload()
  const vault = useCurrentVault()
  const vaultId = getVaultId(vault)
  const { mutate: saveRecord } = useSaveTransactionRecordMutation()
  const { mutate: updateRecord } = useUpdateTransactionRecordMutation()
  // The QUERY, never `useTransactionRecords()`. That helper asserts its data is
  // present, and this provider wraps the whole keysign flow — including the
  // frames before a storage read resolves — so asserting here takes down every
  // signing flow in the app, not just the one that needs the records.
  const recordsQuery = useTransactionRecordsQuery()
  const queryClient = useQueryClient()

  /**
   * Record a broadcast transaction, either against the limit order it cancels
   * or as a row of its own.
   *
   * Async because the records are only needed at this point, and only for the
   * cancel case: reading them lazily keeps the crash-on-first-render out of the
   * render path, and awaiting a refetch when the cache is cold is what stops a
   * cancellation being mistaken for an ordinary send.
   */
  const recordKeysign = async (
    keysignPayload: KeysignPayload,
    txHash: string
  ) => {
    const records =
      recordsQuery.data ?? (await recordsQuery.refetch()).data ?? []

    // A cancellation belongs to the order it closes, not to a row of its own —
    // see `applyLimitOrderCancel`.
    const cancelledOrder = applyLimitOrderCancel({
      records,
      payload: keysignPayload,
      txHash,
    })

    if (cancelledOrder) {
      updateRecord(cancelledOrder)
      return
    }

    saveRecord(
      createTransactionRecord({ payload: keysignPayload, txHash, vaultId })
    )
  }

  return (
    <KeysignMutationListenerProvider
      value={{
        onError: error => {
          parentListener.onError?.(error)
        },
        onSuccess: result => {
          parentListener.onSuccess?.(result)

          if (!('txs' in result)) return
          if (!('keysign' in payload)) return

          const keysignPayload = payload.keysign
          const lastTx = shouldBePresent(
            result.txs[result.txs.length - 1],
            'last transaction in keysign result'
          )

          void recordKeysign(keysignPayload, lastTx.hash)

          if (!keysignPayload.coin) return

          const coin = getKeysignCoin(keysignPayload)
          void queryClient.invalidateQueries({
            queryKey: getBalanceQueryKey(extractAccountCoinKey(coin)),
          })
        },
      }}
    >
      {children}
    </KeysignMutationListenerProvider>
  )
}
