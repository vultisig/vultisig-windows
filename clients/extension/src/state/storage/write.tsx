import {
  CoreWriteStorage,
  CoreWriteStorageProvider,
} from '@core/ui/state/storage/write'
import { ChildrenProp } from '@lib/ui/props'

import { setFiatCurrency } from '../../preferences/fiatCurrency'

const writeStorage: CoreWriteStorage = {
  setFiatCurrency,
}

export const WriteStorageProvider = ({ children }: ChildrenProp) => {
  return (
    <CoreWriteStorageProvider value={writeStorage}>
      {children}
    </CoreWriteStorageProvider>
  )
}
