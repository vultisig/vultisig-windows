import {
  CoreWriteStorage,
  CoreWriteStorageProvider,
} from '@core/ui/state/storage/write'
import { ChildrenProp } from '@lib/ui/props'

import { setFiatCurrency } from '../../preferences/fiatCurrency'
import { setCurrentVaultId } from '../../vault/state/currentVaultId'

const writeStorage: CoreWriteStorage = {
  setFiatCurrency,
  setCurrentVaultId,
}

export const WriteStorageProvider = ({ children }: ChildrenProp) => {
  return (
    <CoreWriteStorageProvider value={writeStorage}>
      {children}
    </CoreWriteStorageProvider>
  )
}
