import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { useVaultOrders, useVaults } from '@core/ui/storage/vaults'
import { useVaultBackupOverride } from '@core/ui/vault/import/state/vaultBackupOverride'
import { SaveVaultStep } from '@core/ui/vault/save/SaveVaultStep'
import { Button } from '@lib/ui/buttons/Button'
import { ValueProp } from '@lib/ui/props'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'
import { getLastItemOrder } from '@vultisig/lib-utils/order/getLastItemOrder'
import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { FlowErrorPageContent } from '../../../flow/FlowErrorPageContent'
import { assertVaultRecoveryReplacement } from '../../../storage/vaultRecoveryReplacement'
import { useUnreadableVaultRecoveryId } from '../../state/currentVault'

export const canReplaceVaultDuringRecovery = ({
  existingVaultId,
  importedVaultId,
  recoveryVaultId,
  hasRecoveryIdentityProof,
}: {
  existingVaultId: string
  importedVaultId: string
  recoveryVaultId: string | null
  hasRecoveryIdentityProof: boolean
}) =>
  hasRecoveryIdentityProof &&
  recoveryVaultId === existingVaultId &&
  importedVaultId === existingVaultId

export const canImportVaultDuringRecovery = ({
  importedVaultId,
  recoveryVaultId,
}: {
  importedVaultId: string
  recoveryVaultId: string | null
}) => recoveryVaultId === null || importedVaultId === recoveryVaultId

export const hasVaultRecoveryIdentityProof = ({
  existingVault,
  importedVault,
}: {
  existingVault: Vault
  importedVault: Vault
}): boolean => {
  try {
    assertVaultRecoveryReplacement({
      currentVault: existingVault,
      expectedVault: existingVault,
      replacementVault: importedVault,
    })
    return true
  } catch {
    return false
  }
}

export const SaveImportedVaultStep = ({
  value,
  onFinish,
}: ValueProp<Vault> & { onFinish?: () => void }) => {
  const { t } = useTranslation()
  const { client } = useCore()
  const navigate = useCoreNavigate()
  const override = useVaultBackupOverride()
  const recoveryVaultId = useUnreadableVaultRecoveryId()

  const initialVaults = useRef(useVaults()).current

  const vaultOrders = useVaultOrders()
  const stableVaultOrders = useRef(vaultOrders).current

  const importedVault = useMemo(
    () => (override ? { ...value, ...override } : value),
    [override, value]
  )

  const recoveryVault = useMemo(() => {
    return initialVaults.find(
      vault =>
        getVaultId(vault) === recoveryVaultId &&
        getVaultId(importedVault) === recoveryVaultId
    )
  }, [importedVault, initialVaults, recoveryVaultId])

  const finalValue = useMemo(() => {
    return {
      ...importedVault,
      order: recoveryVault?.order ?? getLastItemOrder(stableVaultOrders),
      ...(recoveryVault?.folderId ? { folderId: recoveryVault.folderId } : {}),
      ...(recoveryVault?.saplingExtras
        ? { saplingExtras: recoveryVault.saplingExtras }
        : {}),
    }
  }, [importedVault, stableVaultOrders, recoveryVault])

  const error = useMemo(() => {
    const importedVaultId = getVaultId(finalValue)
    if (!canImportVaultDuringRecovery({ importedVaultId, recoveryVaultId })) {
      const recoveryTarget = initialVaults.find(
        vault => getVaultId(vault) === recoveryVaultId
      )
      const recoveryInstruction = t('vault_cannot_be_opened_backup_description')

      return recoveryTarget
        ? `${t('vault_already_exists', {
            name: recoveryTarget.name,
          })} ${recoveryInstruction}`
        : recoveryInstruction
    }

    const existingVault = initialVaults.find(
      v => getVaultId(v) === importedVaultId
    )
    if (
      existingVault &&
      !canReplaceVaultDuringRecovery({
        existingVaultId: getVaultId(existingVault),
        importedVaultId: getVaultId(finalValue),
        recoveryVaultId,
        hasRecoveryIdentityProof: hasVaultRecoveryIdentityProof({
          existingVault,
          importedVault,
        }),
      })
    ) {
      return t('vault_already_exists', {
        name: existingVault.name || finalValue.name,
      })
    }
    if (client === 'extension' && value.libType === 'GG20') {
      return t('extension_vault_import_restriction')
    }
  }, [
    client,
    finalValue,
    importedVault,
    t,
    value.libType,
    initialVaults,
    recoveryVaultId,
  ])

  if (error) {
    return (
      <FlowErrorPageContent
        title={t('failed_to_save_vault')}
        error={error}
        action={
          onFinish ? <Button onClick={onFinish}>{t('skip')}</Button> : undefined
        }
      />
    )
  }

  const handleFinish = () => {
    if (onFinish) {
      onFinish()
      return
    }
    navigate({ id: 'vault' })
  }

  return (
    <SaveVaultStep
      onBack={() => navigate({ id: 'vault' })}
      onFinish={handleFinish}
      recoveryVault={recoveryVault}
      value={finalValue}
      title={t('import_vault')}
    />
  )
}
