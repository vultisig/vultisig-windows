import { CalendarIcon } from '@lib/ui/icons/CalendarIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { PercentIcon } from '@lib/ui/icons/PercentIcon'
import { TrophyIcon } from '@lib/ui/icons/TrophyIcon'
import { LineSeparator } from '@lib/ui/layout/LineSeparator'
import { HStack, VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CircleRewardStat } from './CircleRewardStat'
import { CircleWithdrawButton } from './CircleWithdrawButton'

const mockTotalRewards = 1293230000n
const mockCurrentRewards = 428250000n

export const CircleYieldDetails = () => {
  const { t } = useTranslation()

  return (
    <Container>
      <Text size={14} weight={500} color="shyExtra">
        {t('circle.yield_details')}
      </Text>
      <VStack gap={14}>
        <HStack alignItems="center" justifyContent="space-between">
          <HStack gap={4} alignItems="center">
            <IconWrapper size={16} color="textSupporting">
              <PercentIcon />
            </IconWrapper>
            <Text size={14} weight={500} color="supporting">
              {t('circle.apy')}
            </Text>
          </HStack>
          <Text size={16} weight={500} color="success">
            5.17%
          </Text>
        </HStack>

        <LineSeparator kind="regular" />

        <HStack gap={16} fullWidth>
          <CircleRewardStat
            icon={<CalendarIcon />}
            title={t('circle.total_rewards')}
            value={mockTotalRewards}
          />
          <CircleRewardStat
            icon={<TrophyIcon />}
            title={t('circle.current_rewards')}
            value={mockCurrentRewards}
            kind="primary"
          />
        </HStack>

        <CircleWithdrawButton />
      </VStack>
    </Container>
  )
}

const Container = styled.div`
  padding: 16px;
  border-radius: 16px;
  border: 1px solid ${getColor('foregroundSuper')};
  background: ${getColor('foreground')};
  ${vStack({
    gap: 16,
  })};
`
