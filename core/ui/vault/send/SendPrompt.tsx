import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ArrowUpRightIcon } from '@lib/ui/icons/ArrowUpRightIcon'
import { StationArrowToCornerTopRightIcon } from '@lib/ui/icons/StationFigmaIcons'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import { CoreViewState } from '../../navigation/CoreView'
import { SecondaryActionWrapper } from '../components/PrimaryActions.styled'

export const SendPrompt = (state: CoreViewState<'send'>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { iconStyle } = useTheme()

  return (
    <VStack alignItems="center" gap={8}>
      <SecondaryActionWrapper
        data-testid="vault-action-send"
        onClick={() =>
          navigate({
            id: 'send',
            state,
          })
        }
      >
        {iconStyle === 'station' ? (
          <StationArrowToCornerTopRightIcon />
        ) : (
          <ArrowUpRightIcon />
        )}
      </SecondaryActionWrapper>
      <Text color="shyExtra" size={12}>
        {t('send')}
      </Text>
    </VStack>
  )
}
