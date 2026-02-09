import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const BackupWarningMessage = () => {
  const { t } = useTranslation()

  return (
    <Text size={14} centerHorizontally color="idle">
      {t('backupShareWarning')}
      {t('backupShareWarningRest')}
    </Text>
  )
}
