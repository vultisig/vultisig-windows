import { getPersistentStateProviderSetup } from '@lib/ui/state/getPersistentStateProviderSetup'

import { SendFees } from '../../../mpc/keysign/KeysignActionFees'

const getKey = (vaultId?: string) => `send_fees_${vaultId}`

export const { useState: useSendFees, provider: SendFeesProvider } =
  getPersistentStateProviderSetup<null | SendFees>('SendFees', getKey)
