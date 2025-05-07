import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

import { SendFees } from '../../../mpc/keysign/KeysignActionFees'

export const { useState: useSendFees, provider: SendFeesProvider } =
  getStateProviderSetup<null | SendFees>('SendFees')
