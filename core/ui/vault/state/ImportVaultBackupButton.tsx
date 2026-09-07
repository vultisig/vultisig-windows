import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'

/** Opens the .vult backup import flow. Requires a mounted navigation stack. */
export const ImportVaultBackupButton = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <Button onClick={() => navigate({ id: 'importVault' })}>
      {t('import_vult_backup')}
    </Button>
  )
}
