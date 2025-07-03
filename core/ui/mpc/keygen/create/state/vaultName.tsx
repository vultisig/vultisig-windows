import { ChildrenProp } from '@lib/ui/props'
import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'
import { without } from '@lib/utils/array/without'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useVaultNames } from '../../../../storage/vaults'
import { useVaultSecurityType } from './vaultSecurityType'

export const { useState: useVaultName, provider: VaultNameProvider } =
  getStateProviderSetup<string>('VaultName')

export const GeneratedVaultNameProvider = ({ children }: ChildrenProp) => {
  const vaultSecurityType = useVaultSecurityType()
  const { t } = useTranslation()

  const existingNames = useVaultNames()

  const intitialValue = useMemo(() => {
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

  return (
    <VaultNameProvider initialValue={intitialValue}>
      {children}
    </VaultNameProvider>
  )
}
