import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'

export const SendConfirmLoadingState = () => {
  const { t } = useTranslation()

  return (
    <Button loading disabled={true}>
      {t('loading')}
    </Button>
  )
}
