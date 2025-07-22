import { isExtensionEnv } from '@core/ui/utils/isExtensionEnv'
import { getPersistentStateProviderSetup } from '@core/ui/vault/persistent/getPersistentStateProviderSetup'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

const providerSetup = isExtensionEnv()
  ? getPersistentStateProviderSetup<string>(
      'SendReceiver',
      (vaultId?: string) => `send_receiver_${vaultId}`
    )
  : getStateProviderSetup<string>('SendReceiver')

export const { useState: useSendReceiver, provider: SendReceiverProvider } =
  providerSetup
