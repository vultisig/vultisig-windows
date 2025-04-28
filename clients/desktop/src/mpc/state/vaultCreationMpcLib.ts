import { defaultMpcLib, MpcLib } from '@core/mpc/mpcLib'

import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState'

export const useVaultCreationMpcLib = () => {
  return usePersistentState<MpcLib>(
    PersistentStateKey.VaultCreationMpcLib,
    defaultMpcLib
  )
}
