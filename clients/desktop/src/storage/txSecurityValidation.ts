import { StorageKey } from '@core/ui/storage/StorageKey'
import {
  isTxSecurityValidationEnabled,
  TxSecurityValidationStorage,
} from '@core/ui/storage/txSecurityValidation'

import { persistentStorage } from '../state/persistentState'

export const txSecurityValidationStorage: TxSecurityValidationStorage = {
  getIsTxSecurityValidationEnabled: async () => {
    const value = persistentStorage.getItem<boolean>(
      StorageKey.isTxSecurityValidationEnabled
    )

    if (value === undefined) {
      return isTxSecurityValidationEnabled
    }

    return value
  },
  setIsTxSecurityValidationEnabled: async (enabled: boolean) => {
    persistentStorage.setItem(StorageKey.isTxSecurityValidationEnabled, enabled)
  },
}
