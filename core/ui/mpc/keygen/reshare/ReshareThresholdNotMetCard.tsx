import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled, { keyframes } from 'styled-components'

import { ReshareThresholdBoltIcon } from './ReshareThresholdBoltIcon'

type ReshareThresholdNotMetCardProps = {
  fromDeviceCount: number
  toDeviceCount: number
  requiredSigners: number
}

const Card = styled.div`
  background: ${getColor('background')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 20px;
  padding: 20px;
  width: 100%;
`

const badgeAppear = keyframes`
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

const IconBadge = styled.div`
  align-items: center;
  animation: ${badgeAppear} 0.3s ease;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('mistExtra')};
  border-radius: 50%;
  color: ${getColor('idle')};
  display: flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  width: 40px;
`

/**
 * "Threshold not met" card shown over the reshare device picker when the user
 * drags below the number of devices the vault needs to stay secure. Styled to
 * match the picker's other device cards (circular badge + subtle border).
 */
export const ReshareThresholdNotMetCard = ({
  fromDeviceCount,
  toDeviceCount,
  requiredSigners,
}: ReshareThresholdNotMetCardProps) => {
  const { t } = useTranslation()

  return (
    <Card>
      <HStack gap={12} alignItems="flex-start">
        {/* Re-keyed so the icon re-plays its entrance on every count change. */}
        <IconBadge key={toDeviceCount}>
          <ReshareThresholdBoltIcon style={{ fontSize: 18 }} />
        </IconBadge>
        <VStack gap={4}>
          <Text color="contrast" size={15} weight={500}>
            {t('reshare_threshold_not_met')}
          </Text>
          <Text color="shy" size={13} weight={500}>
            {t('reshare_threshold_not_met_description', {
              from: fromDeviceCount,
              to: toDeviceCount,
              count: requiredSigners,
            })}
          </Text>
        </VStack>
      </HStack>
    </Card>
  )
}
