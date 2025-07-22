import { isExtensionEnv } from '@core/ui/utils/isExtensionEnv'
import { getPersistentStateProviderSetup } from '@core/ui/vault/persistent/getPersistentStateProviderSetup'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

const providerSetup = isExtensionEnv()
  ? getPersistentStateProviderSetup<number | null>(
      'SendAmount',
      (vaultId?: string) => `send_amount_${vaultId}`
    )
  : getStateProviderSetup<number | null>('SendAmount')

export const { useState: useSendAmount, provider: SendAmountProvider } =
  providerSetup
