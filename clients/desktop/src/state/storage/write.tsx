import {
  CoreWriteStorage,
  CoreWriteStorageProvider,
} from '@core/ui/state/storage/write'
import { ChildrenProp } from '@lib/ui/props'
import { useMemo } from 'react'

import { useFiatCurrency } from '../../preferences/state/fiatCurrency'
import { useCurrentVaultId } from '../../vault/state/currentVaultId'

export const WriteStorageProvider = ({ children }: ChildrenProp) => {
  const [, setFiatCurrency] = useFiatCurrency()
  const [, setCurrentVaultId] = useCurrentVaultId()

  const value: CoreWriteStorage = useMemo(
    () => ({ setFiatCurrency, setCurrentVaultId }),
    [setFiatCurrency, setCurrentVaultId]
  )

  return (
    <CoreWriteStorageProvider value={value}>
      {children}
    </CoreWriteStorageProvider>
  )
}
