import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { useVaultOrders, useVaults } from '@core/ui/storage/vaults'
import { useVaultBackupOverride } from '@core/ui/vault/import/state/vaultBackupOverride'
import { SaveVaultStep } from '@core/ui/vault/save/SaveVaultStep'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { FlowErrorPageContent } from '@lib/ui/flow/FlowErrorPageContent'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { ValueProp } from '@lib/ui/props'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const SaveImportedVaultStep = ({ value }: ValueProp<Vault>) => {
  const { t } = useTranslation()
  const { client } = useCore()
  const navigate = useCoreNavigate()
  const navigateBack = useNavigateBack()
  const override = useVaultBackupOverride()

  const vaults = useVaults()

  const vaultOrders = useVaultOrders()

  const finalValue = useMemo(
    () => ({
      ...(override ? { ...value, ...override } : value),
      order: getLastItemOrder(vaultOrders),
    }),
    [override, value, vaultOrders]
  )

  const error = useMemo(() => {
    if (vaults.find(v => getVaultId(v) === getVaultId(finalValue))) {
      return t('vault_already_exists')
    }
    if (client === 'extension' && value.libType === 'GG20') {
      return t('extension_vault_import_restriction')
    }
  }, [client, finalValue, t, value.libType, vaults])

  if (error) {
    return (
      <FlowErrorPageContent
        title={t('failed_to_save_vault')}
        message={error}
        action={<Button onClick={navigateBack}>{t('back')}</Button>}
      />
    )
  }

  return (
    <SaveVaultStep
      onBack={() => navigate({ id: 'vault' })}
      onFinish={() => navigate({ id: 'vault' })}
      value={finalValue}
      title={t('import_vault')}
    />
  )
}
