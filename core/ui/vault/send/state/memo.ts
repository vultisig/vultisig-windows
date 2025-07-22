import { isExtensionEnv } from '@core/ui/utils/isExtensionEnv'
import { getPersistentStateProviderSetup } from '@core/ui/vault/persistent/getPersistentStateProviderSetup'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

const providerSetup = isExtensionEnv()
  ? getPersistentStateProviderSetup<string>(
      'SendMemo',
      (vaultId?: string) => `send_memo_${vaultId}`
    )
  : getStateProviderSetup<string>('SendMemo')

export const { useState: useSendMemo, provider: SendMemoProvider } =
  providerSetup
