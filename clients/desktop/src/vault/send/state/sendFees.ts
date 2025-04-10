import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

import { SendFees } from '../../../lib/types/keysign'

export const { useState: useSendFees, provider: SendFeesProvider } =
  getStateProviderSetup<null | SendFees>('SendFees')
