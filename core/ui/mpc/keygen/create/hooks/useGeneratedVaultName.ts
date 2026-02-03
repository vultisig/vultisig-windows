import { useVaultSecurityType } from '@core/ui/mpc/keygen/create/state/vaultSecurityType'
import { useVaultNames } from '@core/ui/storage/vaults'
import { without } from '@lib/utils/array/without'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const useGeneratedVaultName = () => {
  const vaultSecurityType = useVaultSecurityType()
  const { t } = useTranslation()
  const existingNames = useVaultNames()

  return useMemo(() => {
    const prefix = `${t(vaultSecurityType)} ${t('vault')} #`
    const vaultNamePattern = new RegExp(`^${prefix}(\\d+)$`)
    const vaultNumbers = without(
      existingNames.map(name => {
        const match = name.match(vaultNamePattern)
        return match ? parseInt(match[1], 10) : undefined
      }),
      undefined
    )
    const nextNumber = Math.max(...vaultNumbers, 0) + 1
    return `${prefix}${nextNumber}`
  }, [existingNames, t, vaultSecurityType])
}
