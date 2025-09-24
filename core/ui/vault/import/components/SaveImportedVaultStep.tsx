import { FlowErrorPageContent } from '@core/ui/flow/FlowErrorPageContent'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
import { useVaultOrders, useVaults } from '@core/ui/storage/vaults'
import { useVaultBackupOverride } from '@core/ui/vault/import/state/vaultBackupOverride'
import { SaveVaultStep } from '@core/ui/vault/save/SaveVaultStep'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { Button } from '@lib/ui/buttons/Button'
import { ValueProp } from '@lib/ui/props'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export const SaveImportedVaultStep = ({ value }: ValueProp<Vault>) => {
  const { t } = useTranslation()
  const [state, setState] = useState({ errorMessage: '', isValidated: false })
  const { errorMessage, isValidated } = state
  const { client } = useCore()
  const navigate = useCoreNavigate()
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

  useEffect(() => {
    if (!isValidated) {
      let errorMessage = ''

      if (vaults.find(v => getVaultId(v) === getVaultId(finalValue))) {
        errorMessage = t('vault_already_exists')
      }

      if (client === 'extension' && value.libType === 'GG20') {
        errorMessage = t('extension_vault_import_restriction')
      }

      setState({ errorMessage, isValidated: true })
    }
  }, [client, finalValue, isValidated, t, value.libType, vaults])

  return isValidated ? (
    errorMessage ? (
      <FlowErrorPageContent
        title={t('failed_to_save_vault')}
        error={errorMessage}
        action={
          <Button onClick={() => navigate({ id: 'vault' })}>{t('back')}</Button>
        }
      />
    ) : (
      <SaveVaultStep
        onBack={() => navigate({ id: 'vault' })}
        onFinish={() => navigate({ id: 'vault' })}
        value={finalValue}
        title={t('import_vault')}
      />
    )
  ) : (
    <></>
  )
}
