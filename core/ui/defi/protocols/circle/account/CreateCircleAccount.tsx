import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'

import { useCreateCircleAccountMutation } from './mutations/useCreateCircleAccountMutation'

export const CreateCircleAccount = () => {
  const { t } = useTranslation()

  const { mutate, isPending } = useCreateCircleAccountMutation()

  return (
    <Button onClick={() => mutate()} loading={isPending}>
      {isPending ? t('circle.creating_account') : t('open_account')}
    </Button>
  )
}
