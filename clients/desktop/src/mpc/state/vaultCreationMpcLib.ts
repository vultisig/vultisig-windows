import { mpcLibOptions } from '@vultisig/core-mpc/mpcLib'
import { validateOneOf } from '@vultisig/lib-utils/array/isOneOf'

import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState'

type SelectableMpcLib = (typeof mpcLibOptions)[number]

export const useVaultCreationMpcLib = () => {
  return usePersistentState<SelectableMpcLib>(
    PersistentStateKey.VaultCreationMpcLib,
    'DKLS' satisfies SelectableMpcLib,
    validateOneOf(mpcLibOptions)
  )
}
