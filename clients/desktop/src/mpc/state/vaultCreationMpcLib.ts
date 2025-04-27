import { defaultMpcLib, MpcLib } from '@core/mpc/mpcLib'
import { PersistentStateKey } from '@core/ui/state/PersistentStateKey'

import { usePersistentState } from '../../state/persistentState'

export const useVaultCreationMpcLib = () => {
  return usePersistentState<MpcLib>(
    PersistentStateKey.VaultCreationMpcLib,
    defaultMpcLib
  )
}
