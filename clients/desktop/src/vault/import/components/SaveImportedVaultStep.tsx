import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { SaveVaultStep } from '@core/ui/vault/save/SaveVaultStep'
import { useVaultOrders } from '@core/ui/vault/state/vaults'
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
      onBack={() => navigate('vault')}
      onFinish={() => navigate('vault')}
      value={finalValue}
      title={t('import_vault')}
    />
  )
}
