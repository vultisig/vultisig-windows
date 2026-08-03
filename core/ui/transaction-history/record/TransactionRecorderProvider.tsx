import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import {
  KeysignMutationListenerProvider,
  useKeysignMutationListener,
} from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import {
  useSaveTransactionRecordMutation,
  useTransactionRecords,
  useUpdateTransactionRecordMutation,
} from '@core/ui/storage/transactionHistory'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'
import { useQueryClient } from '@tanstack/react-query'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { getKeysignCoin } from '@vultisig/core-mpc/keysign/utils/getKeysignCoin'
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
  const records = useTransactionRecords()
  const queryClient = useQueryClient()

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
          const txHash = lastTx.hash

          // A cancellation belongs to the order it closes, not to a row of its
          // own — see `applyLimitOrderCancel`.
          const cancelledOrder = applyLimitOrderCancel({
            records,
            payload: keysignPayload,
            txHash,
          })

          if (cancelledOrder) {
            updateRecord(cancelledOrder)
          } else {
            saveRecord(
              createTransactionRecord({
                payload: keysignPayload,
                txHash,
                vaultId,
              })
            )
          }

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
