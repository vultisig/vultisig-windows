import { useCorePathParams } from '@core/ui/navigation/hooks/useCorePathParams'
import {
  defaultVaultSecurityType,
  VaultSecurityType,
} from '@core/ui/vault/VaultSecurityType'
import { useCallback } from 'react'

export const useVaultSecurityType = () => {
  const [{ type }, setParams] = useCorePathParams<'setupVault'>()

  const value: VaultSecurityType = type ?? defaultVaultSecurityType

  const setValue = useCallback(
    (type: VaultSecurityType) => setParams(prev => ({ ...prev, type })),
    [setParams]
  )

  return [value, setValue] as const
}
