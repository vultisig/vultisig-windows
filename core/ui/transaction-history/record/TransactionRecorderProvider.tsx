import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { getKeysignCoin } from '@core/mpc/keysign/utils/getKeysignCoin'
import { getVaultId } from '@core/mpc/vault/Vault'
import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import {
  KeysignMutationListenerProvider,
  useKeysignMutationListener,
} from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import { useSaveTransactionRecordMutation } from '@core/ui/storage/transactionHistory'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useQueryClient } from '@tanstack/react-query'

import { useKeysignMessagePayload } from '../../mpc/keysign/state/keysignMessagePayload'
import { createTransactionRecord } from './createTransactionRecord'

export const TransactionRecorderProvider = ({ children }: ChildrenProp) => {
  const parentListener = useKeysignMutationListener()
  const payload = useKeysignMessagePayload()
  const vault = useCurrentVault()
  const vaultId = getVaultId(vault)
  const { mutate: saveRecord } = useSaveTransactionRecordMutation()
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

          const record = createTransactionRecord({
            payload: keysignPayload,
            txHash,
            vaultId,
          })

          saveRecord(record)

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
