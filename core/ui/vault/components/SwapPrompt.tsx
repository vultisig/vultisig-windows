import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ArrowLeftRightIcon } from '@lib/ui/icons/ArrowLeftRightIcon'
import { StationArrowsRotateCenterIcon } from '@lib/ui/icons/StationFigmaIcons'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import { CoreViewState } from '../../navigation/CoreView'
import { PrimaryActionWrapper } from './PrimaryActions.styled'

export const SwapPrompt = (state: CoreViewState<'swap'>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { iconStyle } = useTheme()

  return (
    <VStack alignItems="center" gap={8}>
      <PrimaryActionWrapper
        data-testid="vault-action-swap"
        onClick={() => navigate({ id: 'swap', state })}
      >
        {iconStyle === 'station' ? (
          <StationArrowsRotateCenterIcon />
        ) : (
          <ArrowLeftRightIcon />
        )}
      </PrimaryActionWrapper>
      <Text color="shyExtra" size={12}>
        {t('swap')}
      </Text>
    </VStack>
  )
}
