import { Vault } from '@core/ui/vault/Vault'
import { ValueProp } from '@lib/ui/props'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { SaveVaultStep } from '../../keygen/shared/SaveVaultStep'
import { useVaultBackupOverride } from '../state/vaultBackupOverride'

export const SaveImportedVaultStep = ({ value }: ValueProp<Vault>) => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const override = useVaultBackupOverride()

  const finalValue = useMemo(
    () => (override ? { ...value, ...override } : value),
    [override, value]
  )

  return (
    <SaveVaultStep
      onForward={() => navigate('vault')}
      value={finalValue}
      title={t('import_vault')}
    />
  )
}
