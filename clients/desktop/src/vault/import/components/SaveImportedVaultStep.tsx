import { ValueProp } from '@lib/ui/props'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { storage } from '../../../../wailsjs/go/models'
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate'
import { SaveVaultStep } from '../../keygen/shared/SaveVaultStep'
import { useVaultBackupOverride } from '../state/vaultBackupOverride'

export const SaveImportedVaultStep = ({ value }: ValueProp<storage.Vault>) => {
  const { t } = useTranslation()
  const navigate = useAppNavigate()
  const override = useVaultBackupOverride()

  const finalValue = useMemo(
    () => (override ? ({ ...value, ...override } as storage.Vault) : value),
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
