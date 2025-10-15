import { CheckCircleIcon } from '@lib/ui/icons/CheckCircleIcon'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

export const ActiveDiscountTierIndicator = () => {
  const { t } = useTranslation()
  return (
    <Text centerVertically={{ gap: 4 }} color="success">
      <CheckCircleIcon />
      {t('active')}
    </Text>
  )
}
