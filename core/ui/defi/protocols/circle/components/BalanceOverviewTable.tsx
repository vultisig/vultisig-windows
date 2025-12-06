import { DollarIcon } from '@lib/ui/icons/DollarIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { TrophyIcon } from '@lib/ui/icons/TrophyIcon'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export const BalanceOverviewTable = () => {
  const { t } = useTranslation()

  return (
    <HStack gap={8}>
      <ItemWrapper>
        <DollarIconWrapper color="info" size={16}>
          <DollarIcon />
        </DollarIconWrapper>
        <VStack gap={4}>
          <Text size={13} color="shyExtra">
            {t('circle.total_deposit')}
          </Text>
          <Text size={16}>
            {/* TODO: tony to fill in with real values when API is available */}
          </Text>
        </VStack>
      </ItemWrapper>
      <ItemWrapper>
        <TrohpyIconWrapper size={16} color="success">
          <TrophyIcon />
        </TrohpyIconWrapper>
        <VStack gap={4}>
          <Text size={13} color="shyExtra">
            {t('circle.rewards')}
          </Text>
          <Text size={16}>
            {/* TODO: tony to fill in with real values when API is available */}
          </Text>
        </VStack>
      </ItemWrapper>
    </HStack>
  )
}

const StyledIconWrapper = styled(IconWrapper)`
  padding: 8px;
  border-radius: 8px;
`

const DollarIconWrapper = styled(StyledIconWrapper)`
  background: rgba(92, 167, 255, 0.1);
`

const TrohpyIconWrapper = styled(StyledIconWrapper)`
  background: rgba(19, 200, 157, 0.1);
`

const ItemWrapper = styled.div`
  ${vStack({
    gap: 24,
    flexGrow: true,
  })};

  padding: 12px;
  border-radius: 12px;
  background: #11284a;
`
