import { getVaultId } from '@core/mpc/vault/Vault'
import { KeysignMutationListenerProvider } from '@core/ui/mpc/keysign/action/state/keysignMutationListener'
import { useSaveTransactionRecordMutation } from '@core/ui/storage/transactionHistory'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { ChildrenProp } from '@lib/ui/props'

import { useKeysignMessagePayload } from '../../mpc/keysign/state/keysignMessagePayload'
import { createTransactionRecord } from './createTransactionRecord'

export const TransactionRecorderProvider = ({ children }: ChildrenProp) => {
  const payload = useKeysignMessagePayload()
  const vault = useCurrentVault()
  const vaultId = getVaultId(vault)
  const { mutate: saveRecord } = useSaveTransactionRecordMutation()

  return (
    <KeysignMutationListenerProvider
      value={{
        onSuccess: result => {
          if (!('txs' in result)) return
          if (!('keysign' in payload)) return

          const keysignPayload = payload.keysign
          const txHash = result.txs[result.txs.length - 1].hash

          const record = createTransactionRecord({
            payload: keysignPayload,
            txHash,
            vaultId,
          })

          saveRecord(record)
        },
      }}
    >
      {children}
    </KeysignMutationListenerProvider>
  )
}
