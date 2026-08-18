import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { useVaultOrders, useVaults } from '@core/ui/storage/vaults'
import { useVaultBackupOverride } from '@core/ui/vault/import/state/vaultBackupOverride'
import { SaveVaultStep } from '@core/ui/vault/save/SaveVaultStep'
import { Button } from '@lib/ui/buttons/Button'
import { ValueProp } from '@lib/ui/props'
import { getVaultId, Vault } from '@vultisig/core-mpc/vault/Vault'
import { getLastItemOrder } from '@vultisig/lib-utils/order/getLastItemOrder'
import { getRecordKeys } from '@vultisig/lib-utils/record/getRecordKeys'
import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { FlowErrorPageContent } from '../../../flow/FlowErrorPageContent'
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

export const hasVaultRecoveryIdentityProof = ({
  existingVault,
  importedVault,
}: {
  existingVault: Vault
  importedVault: Vault
}): boolean => {
  if (importedVault.keyShares.ecdsa) return true

  if (
    existingVault.libType !== 'KeyImport' ||
    importedVault.libType !== 'KeyImport'
  ) {
    return false
  }

  const chainShareKeys = getRecordKeys(importedVault.chainKeyShares ?? {})
  const chainSharesMatch = chainShareKeys.every(
    chain =>
      Boolean(importedVault.chainKeyShares?.[chain]) &&
      Boolean(importedVault.chainPublicKeys?.[chain]) &&
      importedVault.chainPublicKeys?.[chain] ===
        existingVault.chainPublicKeys?.[chain]
  )
  const hasMldsaShare = Boolean(importedVault.keyShareMldsa)
  const mldsaShareMatches =
    !hasMldsaShare ||
    (Boolean(importedVault.publicKeyMldsa) &&
      importedVault.publicKeyMldsa === existingVault.publicKeyMldsa)

  return (
    (chainShareKeys.length > 0 || hasMldsaShare) &&
    chainSharesMatch &&
    mldsaShareMatches
  )
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

  const finalValue = useMemo(() => {
    const overriddenValue = override ? { ...value, ...override } : value
    const recoveryVault = initialVaults.find(
      vault =>
        getVaultId(vault) === recoveryVaultId &&
        getVaultId(overriddenValue) === recoveryVaultId
    )

    return {
      ...overriddenValue,
      order: recoveryVault?.order ?? getLastItemOrder(stableVaultOrders),
      ...(recoveryVault?.folderId ? { folderId: recoveryVault.folderId } : {}),
    }
  }, [override, value, stableVaultOrders, initialVaults, recoveryVaultId])

  const error = useMemo(() => {
    const existingVault = initialVaults.find(
      v => getVaultId(v) === getVaultId(finalValue)
    )
    if (
      existingVault &&
      !canReplaceVaultDuringRecovery({
        existingVaultId: getVaultId(existingVault),
        importedVaultId: getVaultId(finalValue),
        recoveryVaultId,
        hasRecoveryIdentityProof: hasVaultRecoveryIdentityProof({
          existingVault,
          importedVault: finalValue,
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
  }, [client, finalValue, t, value.libType, initialVaults, recoveryVaultId])

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
      value={finalValue}
      title={t('import_vault')}
    />
  )
}
