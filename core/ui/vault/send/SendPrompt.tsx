import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ArrowUpRightIcon } from '@lib/ui/icons/ArrowUpRightIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { CoreViewState } from '../../navigation/CoreView'
import { SecondaryActionWrapper } from '../components/PrimaryActions.styled'

type SendPromptProps = CoreViewState<'send'> & {
  disabledReason?: string
}

export const SendPrompt = ({ disabledReason, ...state }: SendPromptProps) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <VStack alignItems="center" gap={8}>
      <SecondaryActionWrapper
        style={
          disabledReason ? { opacity: 0.4, pointerEvents: 'none' } : undefined
        }
        onClick={() =>
          navigate({
            id: 'send',
            state,
          })
        }
      >
        <ArrowUpRightIcon />
      </SecondaryActionWrapper>
      <Text
        color="shyExtra"
        size={12}
        style={
          disabledReason ? { textAlign: 'center', maxWidth: 80 } : undefined
        }
      >
        {disabledReason ?? t('send')}
      </Text>
    </VStack>
  )
}
