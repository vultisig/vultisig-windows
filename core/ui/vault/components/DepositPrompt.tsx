import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { IconArrowRowDown } from '@lib/ui/icons/IconArrowRowDown'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useTranslation } from 'react-i18next'

import { CoreViewState } from '../../navigation/CoreView'
import { chainActionsRecord } from '../deposit/ChainAction'
import { DepositEnabledChain } from '../deposit/DepositEnabledChain'
import { useAvailableChainActions } from '../deposit/hooks/useAvailableChainActions'
import { SecondaryActionWrapper } from './PrimaryActions.styled'

const toastDuration = 3000

export const DepositPrompt = (state: CoreViewState<'deposit'>) => {
  const navigate = useCoreNavigate()
  const { t } = useTranslation()
  const actions = useAvailableChainActions(state.coin.chain)
  const { addToast } = useToast()

  return (
    <VStack alignItems="center" gap={8}>
      <SecondaryActionWrapper
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
      >
        <IconArrowRowDown />
      </SecondaryActionWrapper>
      <Text color="shyExtra" size={12}>
        {t('receive')}
      </Text>
    </VStack>
  )
}
