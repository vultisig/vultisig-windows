import {
  formatTronResourceValue,
  TronAccountResources,
} from '@core/chain/chains/tron/resources'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { TronResourceBar } from './TronResourceBar'

type ResourcesCardProps = {
  data: TronAccountResources
}

export const ResourcesCard = ({ data }: ResourcesCardProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const successColor = theme.colors.primary.toCssValue()
  const warningColor = '#F0A030'

  const bandwidthPercentage =
    data.bandwidth.total > 0
      ? data.bandwidth.available / data.bandwidth.total
      : 0

  const energyPercentage =
    data.energy.total > 0 ? data.energy.available / data.energy.total : 0

  return (
    <ResourcesPanel>
      <HStack fullWidth>
        <ResourceHalf>
          <Text color="primary" size={12} weight="600">
            {t('tron_bandwidth')}
          </Text>
          <HStack alignItems="center" gap={8}>
            <ResourceIconWrapper $color={successColor}>
              <Text size={16}>{'\u2261'}</Text>
            </ResourceIconWrapper>
            <VStack gap={4} style={{ flex: 1, minWidth: 0 }}>
              <Text color="contrast" size={13} weight="500">
                {formatTronResourceValue({
                  available: data.bandwidth.available,
                  total: data.bandwidth.total,
                  unit: 'KB',
                })}
              </Text>
              <TronResourceBar
                percentage={bandwidthPercentage}
                color={successColor}
              />
            </VStack>
          </HStack>
        </ResourceHalf>

        <Divider />

        <ResourceHalf>
          <Text style={{ color: warningColor }} size={12} weight="600">
            {t('tron_energy')}
          </Text>
          <HStack alignItems="center" gap={8}>
            <ResourceIconWrapper $color={warningColor}>
              <Text size={16}>{'\u26A1'}</Text>
            </ResourceIconWrapper>
            <VStack gap={4} style={{ flex: 1, minWidth: 0 }}>
              <Text color="contrast" size={13} weight="500">
                {formatTronResourceValue({
                  available: data.energy.available,
                  total: data.energy.total,
                  unit: '',
                })}
              </Text>
              <TronResourceBar
                percentage={energyPercentage}
                color={warningColor}
              />
            </VStack>
          </HStack>
        </ResourceHalf>
      </HStack>
    </ResourcesPanel>
  )
}

const ResourcesPanel = styled(Panel)`
  padding: 12px 0;
`

const ResourceHalf = styled(VStack)`
  flex: 1;
  gap: 6px;
  padding: 0 16px;
`

const Divider = styled.div`
  width: 1px;
  align-self: stretch;
  background: ${getColor('foregroundExtra')};
`

const ResourceIconWrapper = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => `${$color}26`};
  flex-shrink: 0;
`
