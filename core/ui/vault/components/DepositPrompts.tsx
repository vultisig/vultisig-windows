import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useTranslation } from 'react-i18next'

import { CoreViewState } from '../../navigation/CoreView'
import { chainActionsRecord } from '../deposit/ChainAction'
import { DepositEnabledChain } from '../deposit/DepositEnabledChain'
import { useAvailableChainActions } from '../deposit/hooks/useAvailableChainActions'

const toastDuration = 3000

export const DepositPrompt = (state: CoreViewState<'deposit'>) => {
  const navigate = useCoreNavigate()
  const { t } = useTranslation()
  const actions = useAvailableChainActions(state.coin.chain)
  const { addToast } = useToast()

  return (
    <Button
      kind="secondary"
      onClick={() => {
        if (actions.length === 0) {
          addToast({
            message: `${t('function_unavailble')} ${chainActionsRecord[state.coin.chain as DepositEnabledChain]}`,
            duration: toastDuration,
          })

          return
        }

        navigate({ id: 'deposit', state })
      }}
      style={{ textTransform: 'uppercase' }}
    >
      {t('deposit')}
    </Button>
  )
}
