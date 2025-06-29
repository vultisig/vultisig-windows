import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'

import { CoreViewState } from '../../navigation/CoreView'

export const SendPrompt = (state: CoreViewState<'send'>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <Button
      kind="secondary"
      onClick={() =>
        navigate({
          id: 'send',
          state,
        })
      }
      style={{ textTransform: 'uppercase' }}
    >
      {t('send')}
    </Button>
  )
}
