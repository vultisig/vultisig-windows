import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ArrowsRotateCenterIcon } from '@lib/ui/icons/ArrowsRotateCenterIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { CoreViewState } from '../../navigation/CoreView'
import { PrimaryActionWrapper } from './PrimaryActions.styled'

export const SwapPrompt = (state: CoreViewState<'swap'>) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()

  return (
    <VStack alignItems="center" gap={8}>
      <PrimaryActionWrapper
        data-testid="vault-action-swap"
        onClick={() => navigate({ id: 'swap', state })}
      >
        <ArrowsRotateCenterIcon />
      </PrimaryActionWrapper>
      <Text color="shyExtra" size={12}>
        {t('swap')}
      </Text>
    </VStack>
  )
}
