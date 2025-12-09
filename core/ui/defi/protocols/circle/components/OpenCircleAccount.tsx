import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'

import { useOpenCircleAccountMutation } from '../mutations/useOpenCircleAccountMutation'

export const OpenCircleAccount = () => {
  const { t } = useTranslation()
  const { mutate, isPending } = useOpenCircleAccountMutation()

  return (
    <Button loading={isPending} onClick={() => mutate()}>
      {t('circle.open_account')}
    </Button>
  )
}
