import { defaultMpcLib, MpcLib, mpcLibOptions } from '@core/mpc/mpcLib'
import { validateOneOf } from '@lib/utils/array/isOneOf'

import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState'

export const useVaultCreationMpcLib = () => {
  return usePersistentState<MpcLib>(
    PersistentStateKey.VaultCreationMpcLib,
    defaultMpcLib,
    validateOneOf(mpcLibOptions)
  )
}
