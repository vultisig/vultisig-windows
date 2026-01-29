import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const BackupWarningMessage = () => {
  const { t } = useTranslation()

  return (
    <Text size={14} centerHorizontally>
      <Text as="span" color="idle">
        {t('backupShareWarning')}
      </Text>
      <Text as="span" color="shy">
        {t('backupShareWarningRest')}
      </Text>
    </Text>
  )
}
