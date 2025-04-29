import {
  CoreWriteStorage,
  CoreWriteStorageProvider,
} from '@core/ui/state/storage/write'
import { ChildrenProp } from '@lib/ui/props'
import { useMemo } from 'react'

import { useFiatCurrency } from '../preferences/state/fiatCurrency'

export const StorageProvider = ({ children }: ChildrenProp) => {
  const [, setFiatCurrency] = useFiatCurrency()

  const value: CoreWriteStorage = useMemo(
    () => ({ setFiatCurrency }),
    [setFiatCurrency]
  )

  return (
    <CoreWriteStorageProvider value={value}>
      {children}
    </CoreWriteStorageProvider>
  )
}
