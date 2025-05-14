import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useVaultOrders } from '@core/ui/storage/vaults'
import { SaveVaultStep } from '@core/ui/vault/save/SaveVaultStep'
import { Vault } from '@core/ui/vault/Vault'
import { ValueProp } from '@lib/ui/props'
import { getLastItemOrder } from '@lib/utils/order/getLastItemOrder'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useVaultBackupOverride } from '../state/vaultBackupOverride'

export const SaveImportedVaultStep = ({ value }: ValueProp<Vault>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const override = useVaultBackupOverride()

  const vaultOrders = useVaultOrders()

  const finalValue = useMemo(
    () => ({
      ...(override ? { ...value, ...override } : value),
      order: getLastItemOrder(vaultOrders),
    }),
    [override, value, vaultOrders]
  )

  return (
    <SaveVaultStep
      onBack={() => navigate({ id: 'vault' })}
      onFinish={() => navigate({ id: 'vault' })}
      value={finalValue}
      title={t('import_vault')}
    />
  )
}
