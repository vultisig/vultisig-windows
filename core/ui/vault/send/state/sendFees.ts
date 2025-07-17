import { getPersistentStateProviderSetup } from '@lib/ui/state/getPersistentStateProviderSetup'

import { SendFees } from '../../../mpc/keysign/KeysignActionFees'

const getKey = (vaultId?: string) => `send_fees_${vaultId ?? 'unknown'}`

export const { useState: useSendFees, provider: SendFeesProvider } =
  getPersistentStateProviderSetup<null | SendFees>('SendFees', getKey)
