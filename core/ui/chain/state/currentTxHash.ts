import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

import { KeysignMutationResult } from '../../mpc/keysign/action/mutations/useKeysignMutation'

export const {
  useValue: useCurrentTxHashes,
  provider: CurrentTxHashesProvider,
} = getValueProviderSetup<KeysignMutationResult>('CurrentTxHash')
