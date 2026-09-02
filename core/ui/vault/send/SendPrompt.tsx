import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCore } from '@core/ui/state/core'
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
  const { client } = useCore()
  const { iconStyle } = useTheme()
  const isExtension = client === 'extension'

  return (
    <VStack alignItems="center" gap={8}>
      <SecondaryActionWrapper
        $isExtension={isExtension}
        data-testid="vault-action-send"
        onClick={() =>
          navigate({
            id: 'send',
            state,
          })
        }
      >
        {isExtension || iconStyle === 'station' ? (
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
