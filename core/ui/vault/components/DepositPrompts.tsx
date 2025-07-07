import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'

import { CoreViewState } from '../../navigation/CoreView'

export const DepositPrompt = (state: CoreViewState<'deposit'>) => {
  const navigate = useCoreNavigate()
  const { t } = useTranslation()

  return (
    <Button
      kind="secondary"
      onClick={() => navigate({ id: 'deposit', state })}
      style={{ textTransform: 'uppercase' }}
    >
      {t('deposit')}
    </Button>
  )
}
