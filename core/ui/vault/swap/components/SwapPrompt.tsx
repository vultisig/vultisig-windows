import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { useTranslation } from 'react-i18next'

import { CoreViewState } from '../../../navigation/CoreView'

export const SwapPrompt = (state: CoreViewState<'swap'>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <Button
      kind="secondary"
      onClick={() => navigate({ id: 'swap', state })}
      style={{ textTransform: 'uppercase' }}
    >
      {t('swap')}
    </Button>
  )
}
