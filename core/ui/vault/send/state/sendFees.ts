import { isExtensionEnv } from '@core/ui/utils/isExtensionEnv'
import { getPersistentStateProviderSetup } from '@core/ui/vault/persistent/getPersistentStateProviderSetup'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

import { SendFees } from '../../../mpc/keysign/KeysignActionFees'

const providerSetup = isExtensionEnv()
  ? getPersistentStateProviderSetup<null | SendFees>(
      'SendFees',
      (vaultId?: string) => `send_fees_${vaultId}`
    )
  : getStateProviderSetup<null | SendFees>('SendFees')

export const { useState: useSendFees, provider: SendFeesProvider } =
  providerSetup
