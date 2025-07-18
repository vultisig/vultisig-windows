import { StorageKey } from '@core/ui/storage/StorageKey'
import {
  isTxSecurityValidationEnabled,
  TxSecurityValidationStorage,
} from '@core/ui/storage/txSecurityValidation'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

export const txSecurityValidationStorage: TxSecurityValidationStorage = {
  getIsTxSecurityValidationEnabled: () =>
    getPersistentState(
      StorageKey.isTxSecurityValidationEnabled,
      isTxSecurityValidationEnabled
    ),
  setIsTxSecurityValidationEnabled: async value => {
    await setPersistentState(StorageKey.isTxSecurityValidationEnabled, value)
  },
}
