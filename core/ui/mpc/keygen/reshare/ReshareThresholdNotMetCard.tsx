import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ReshareAppStoreIcon } from './ReshareAppStoreIcon'
import { ReshareThresholdBoltIcon } from './ReshareThresholdBoltIcon'

type ReshareThresholdNotMetCardProps = {
  fromDeviceCount: number
  toDeviceCount: number
  requiredSigners: number
}

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`

const Card = styled.div`
  position: relative;
  z-index: 1;
  background: ${getColor('background')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 24px 24px 20px 20px;
  padding: 24px 20px;
`

// Sits behind the card and peeks out below it (Figma stacks the two frames with
// a negative gap), so its flat top tucks under the card's rounded bottom.
const PluginStoreStrip = styled(HStack)`
  position: relative;
  z-index: 0;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: -22px;
  padding: 32px 32px 14px;
  background: ${getColor('foreground')};
  border-radius: 0 0 24px 24px;
`

const IconBadge = styled.div`
  align-items: center;
  background: ${getColor('background')};
  border: 1px solid ${getColor('mistExtra')};
  border-radius: 50%;
  color: ${getColor('idle')};
  display: flex;
  flex-shrink: 0;
  height: 28px;
  justify-content: center;
  width: 28px;
`

/**
 * "Threshold not met" card shown over the reshare device picker when the user
 * drags below the number of devices the vault needs to stay secure. When the
 * user drags all the way down to a single device, a "Plugin Store compatible"
 * strip peeks out below the card, matching the Figma reshare redesign.
 */
export const ReshareThresholdNotMetCard = ({
  fromDeviceCount,
  toDeviceCount,
  requiredSigners,
}: ReshareThresholdNotMetCardProps) => {
  const { t } = useTranslation()

  const isSingleDevice = toDeviceCount === 1

  return (
    <Wrapper>
      <Card>
        <HStack gap={12} alignItems="flex-start">
          <IconBadge>
            <ReshareThresholdBoltIcon style={{ fontSize: 14 }} />
          </IconBadge>
          <VStack gap={4}>
            <Text color="contrast" size={15} weight={500}>
              {t('reshare_threshold_not_met')}
            </Text>
            <Text color="shy" size={13} weight={500}>
              <Trans
                i18nKey="reshare_threshold_not_met_description"
                values={{
                  from: fromDeviceCount,
                  to: toDeviceCount,
                  count: requiredSigners,
                }}
                components={{ w: <Text as="span" color="contrast" /> }}
              />
            </Text>
          </VStack>
        </HStack>
      </Card>
      {isSingleDevice ? (
        <PluginStoreStrip>
          <ReshareAppStoreIcon style={{ fontSize: 16 }} />
          <Text color="contrast" size={13} weight={500}>
            {t('plugin_store_compatible')}
          </Text>
        </PluginStoreStrip>
      ) : null}
    </Wrapper>
  )
}
