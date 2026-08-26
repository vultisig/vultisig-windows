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
import { isCancelLimitSwapMemo } from '@vultisig/core-chain/swap/native/limitSwapCancelMemo'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'

import { useKeysignMessagePayload } from '../../mpc/keysign/state/keysignMessagePayload'
import { applyLimitOrderCancel } from './applyLimitOrderCancel'
import { createTransactionRecord } from './createTransactionRecord'
import { getKeysignAffectedCoinKeys } from './getKeysignAffectedCoinKeys'

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
    const records = recordsQuery.data ?? (await recordsQuery.refetch()).data

    if (records) {
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
    }

    // No order to attach this cancellation to — either the history could not be
    // read, or it was read and holds no matching order. The second is ordinary
    // on a CO-SIGNER, whose own history never saw the placement it is helping
    // close.
    //
    // Either way, falling through would file the cancellation as a send:
    // `createTransactionRecord` has no cancel branch, so a dust transfer to an
    // inbound vault would appear as a payment the user never made, while the
    // order it closes shows no sign of it. Recording nothing is the lesser
    // wrong; the tracker still closes the order when the queue drops it.
    if (isCancelLimitSwapMemo(keysignPayload.memo)) {
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

          // Fire-and-forget, but not silently: an unhandled rejection here
          // would drop the transaction from history with nothing to show for it.
          recordKeysign(keysignPayload, lastTx.hash).catch(error => {
            console.error('Failed to record a broadcast transaction', error)
          })

          if (!keysignPayload.coin) return

          // Mark stale WITHOUT refetching. At broadcast the node almost always
          // still reports pre-transaction balances, so reading now would cache
          // the old amount and reset its freshness — leaving the stale figure
          // pinned for a whole `staleTime` window. `TransactionStatusWatcher`
          // refetches once the transaction actually confirms.
          getKeysignAffectedCoinKeys(keysignPayload).forEach(coinKey => {
            void queryClient.invalidateQueries({
              queryKey: getBalanceQueryKey(coinKey),
              refetchType: 'none',
            })
          })
        },
      }}
    >
      {children}
    </KeysignMutationListenerProvider>
  )
}
