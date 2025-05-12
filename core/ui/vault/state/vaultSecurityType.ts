import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import {
  defaultVaultSecurityType,
  VaultSecurityType,
} from '@core/ui/vault/VaultSecurityType'
import { useCallback } from 'react'

export const useVaultSecurityType = () => {
  const [{ type }, setParams] = useCoreViewState<'setupVault'>()

  const value: VaultSecurityType = type ?? defaultVaultSecurityType

  const setValue = useCallback(
    (type: VaultSecurityType) => setParams(prev => ({ ...prev, type })),
    [setParams]
  )

  return [value, setValue] as const
}
