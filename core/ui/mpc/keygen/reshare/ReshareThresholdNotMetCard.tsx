import { TriangleAlertIcon } from '@lib/ui/icons/TriangleAlertIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type ReshareThresholdNotMetCardProps = {
  fromDeviceCount: number
  toDeviceCount: number
  requiredSigners: number
}

const IconBox = styled.div`
  align-items: center;
  background: ${({ theme }) =>
    theme.colors.idle.getVariant({ a: () => 0.12 }).toCssValue()};
  border-radius: 10px;
  color: ${getColor('idle')};
  display: flex;
  flex-shrink: 0;
  height: 36px;
  justify-content: center;
  width: 36px;
`

/**
 * "Threshold not met" card shown over the reshare device picker when the user
 * drags below the number of devices the vault needs to stay secure.
 */
export const ReshareThresholdNotMetCard = ({
  fromDeviceCount,
  toDeviceCount,
  requiredSigners,
}: ReshareThresholdNotMetCardProps) => {
  const { t } = useTranslation()

  return (
    <Panel>
      <HStack gap={12} alignItems="flex-start">
        <IconBox>
          <TriangleAlertIcon fontSize={20} />
        </IconBox>
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
    </Panel>
  )
}
