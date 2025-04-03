import { useAppPathParams } from '@lib/ui/navigation/hooks/useAppPathParams'
import { useCallback } from 'react'

import { defaultSetupVaultType, SetupVaultType } from '../SetupVaultType'

export const useSetupVaultType = () => {
  const [{ type }, setParams] = useAppPathParams<'setupVault'>()

  const value: SetupVaultType = type ?? defaultSetupVaultType

  const setValue = useCallback(
    (type: SetupVaultType) => setParams(prev => ({ ...prev, type })),
    [setParams]
  )

  return [value, setValue] as const
}
