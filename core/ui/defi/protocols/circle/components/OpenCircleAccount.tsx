import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'

import { useOpenCircleAccountMutation } from '../mutations/useOpenCircleAccountMutation'

type OpenCircleAccountProps = {
  isPending?: boolean
}

export const OpenCircleAccount = ({
  isPending = false,
}: OpenCircleAccountProps) => {
  const { t } = useTranslation()
  const { mutate, isPending: isMutationPending } =
    useOpenCircleAccountMutation()

  const isLoading = isPending || isMutationPending

  return (
    <Button disabled={isLoading} loading={isLoading} onClick={() => mutate()}>
      {t('circle.open_account')}
    </Button>
  )
}
