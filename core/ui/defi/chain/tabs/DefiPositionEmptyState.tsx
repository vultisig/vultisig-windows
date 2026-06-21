import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Button } from '@lib/ui/buttons/Button'
import { CryptoIcon } from '@lib/ui/icons/CryptoIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCurrentDefiChain } from '../useCurrentDefiChain'
import { DefiChainPageTab } from './config'

type DefiPositionEmptyStateProps = {
  returnTab?: DefiChainPageTab
}

export const DefiPositionEmptyState = ({
  returnTab,
}: DefiPositionEmptyStateProps) => {
  const { t } = useTranslation()
  const chain = useCurrentDefiChain()
  const navigate = useCoreNavigate()

  return (
    <EmptyWrapper>
      <VStack gap={12} alignItems="center">
        <IconWrapper size={24} color="primaryAccentFour">
          <CryptoIcon />
        </IconWrapper>
        <VStack gap={8}>
          <Text centerHorizontally size={17} weight="600">
            {t('no_positions_selected')}
          </Text>
          <Text size={13} color="shy" centerHorizontally>
            {t('no_positions_selected_description')}
          </Text>
        </VStack>
      </VStack>
      <CtaWrapper>
        <Button
          onClick={() =>
            navigate({
              id: 'manageDefiPositions',
              state: { chain, returnTab },
            })
          }
        >
          {t('manage_positions')}
        </Button>
      </CtaWrapper>
    </EmptyWrapper>
  )
}

const EmptyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 20px;
  background-color: ${getColor('foreground')};
  border-radius: 12px;
`

const CtaWrapper = styled.div`
  width: fit-content;
`
