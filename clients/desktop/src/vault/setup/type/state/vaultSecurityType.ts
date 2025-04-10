import {
  defaultVaultSecurityType,
  VaultSecurityType,
} from '@core/ui/vault/VaultSecurityType'
import { useCallback } from 'react'

import { useAppPathParams } from '../../../../navigation/hooks/useAppPathParams'

export const useVaultSecurityType = () => {
  const [{ type }, setParams] = useAppPathParams<'setupVault'>()

  const value: VaultSecurityType = type ?? defaultVaultSecurityType

  const setValue = useCallback(
    (type: VaultSecurityType) => setParams(prev => ({ ...prev, type })),
    [setParams]
  )

  return [value, setValue] as const
}
