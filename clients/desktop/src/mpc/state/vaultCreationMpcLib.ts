import { defaultMpcLib, MpcLib } from '@core/mpc/mpcLib'

import { usePersistentState } from '../../state/persistentState'
import { PersistentStateKey } from '@core/ui/state/PersistentStateKey'

export const useVaultCreationMpcLib = () => {
  return usePersistentState<MpcLib>(
    PersistentStateKey.VaultCreationMpcLib,
    defaultMpcLib
  )
}
