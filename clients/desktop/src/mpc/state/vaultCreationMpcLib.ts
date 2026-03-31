import { mpcLibOptions } from '@vultisig/core-mpc/mpcLib'
import { validateOneOf } from '@vultisig/lib-utils/array/isOneOf'

import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState'

type VaultCreationMpcLib = (typeof mpcLibOptions)[number]

const defaultVaultCreationMpcLib: VaultCreationMpcLib = 'DKLS'

export const useVaultCreationMpcLib = () => {
  return usePersistentState<VaultCreationMpcLib>(
    PersistentStateKey.VaultCreationMpcLib,
    defaultVaultCreationMpcLib,
    validateOneOf(mpcLibOptions)
  )
}
