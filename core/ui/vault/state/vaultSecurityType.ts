import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import {
  defaultVaultSecurityType,
  VaultSecurityType,
} from '@core/ui/vault/VaultSecurityType'
import { useCallback } from 'react'

export const useVaultSecurityType = () => {
  const [{ type }, setParams] = useCorePathState<'setupVault'>()

  const value: VaultSecurityType = type ?? defaultVaultSecurityType

  const setValue = useCallback(
    (type: VaultSecurityType) => setParams(prev => ({ ...prev, type })),
    [setParams]
  )

  return [value, setValue] as const
}
