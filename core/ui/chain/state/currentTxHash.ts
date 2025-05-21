import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

import { KeysignMutationResult } from '../../mpc/keysign/action/mutations/useKeysignMutation'

export const { useValue: useCurrentTxHash, provider: CurrentTxHashProvider } =
  getValueProviderSetup<KeysignMutationResult>('CurrentTxHash')
