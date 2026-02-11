import {
  formatTronResourceValue,
  TronAccountResources,
} from '@core/chain/chains/tron/resources'
import { BatteryChargingIcon } from '@lib/ui/icons/BatteryChargingIcon'
import { InfoCircleIcon } from '@lib/ui/icons/InfoCircleIcon'
import { SatelliteDishIcon } from '@lib/ui/icons/SatelliteDishIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { TronResourceBar } from './TronResourceBar'

type ResourcesCardProps = {
  data: TronAccountResources
  onInfoPress: () => void
}

const bandwidthAccent = '#13C89D'
const energyAccent = '#FFC25C'
const bandwidthBarColor = '#4879FD'

const Card = styled(VStack)`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('background')};
  gap: 16px;
`

const IconBox = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => `${$color}1A`};
  flex-shrink: 0;
`

const InfoButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #8295ae;
  flex-shrink: 0;
`

type ResourceCardItemProps = {
  icon: ReactNode
  accentColor: string
  barColor: string
  title: string
  value: string
  percentage: number
  trailing?: ReactNode
}

const ResourceCardItem: FC<ResourceCardItemProps> = ({
  icon,
  accentColor,
  barColor,
  title,
  value,
  percentage,
  trailing,
}) => (
  <Card>
    <HStack gap={8} alignItems="center">
      <IconBox $color={accentColor}>{icon}</IconBox>
      <VStack gap={2} style={{ flex: 1 }}>
        <Text color="contrast" size={14} weight="500">
          {title}
        </Text>
        <Text color="shyExtra" size={12} weight="500">
          {value}
        </Text>
      </VStack>
      {trailing}
    </HStack>
    <TronResourceBar percentage={percentage} color={barColor} />
  </Card>
)

export const ResourcesCard = ({ data, onInfoPress }: ResourcesCardProps) => {
  const { t } = useTranslation()

  const bandwidthPercentage =
    data.bandwidth.total > 0
      ? data.bandwidth.available / data.bandwidth.total
      : 0

  const energyPercentage =
    data.energy.total > 0 ? data.energy.available / data.energy.total : 0

  return (
    <HStack fullWidth gap={12}>
      <ResourceCardItem
        icon={
          <SatelliteDishIcon style={{ fontSize: 24, color: bandwidthAccent }} />
        }
        accentColor={bandwidthAccent}
        barColor={bandwidthBarColor}
        title={t('tron_bandwidth')}
        value={formatTronResourceValue({
          available: data.bandwidth.available,
          total: data.bandwidth.total,
          unit: '',
        })}
        percentage={bandwidthPercentage}
      />
      <ResourceCardItem
        icon={
          <BatteryChargingIcon style={{ fontSize: 24, color: energyAccent }} />
        }
        accentColor={energyAccent}
        barColor={energyAccent}
        title={t('tron_energy')}
        value={formatTronResourceValue({
          available: data.energy.available,
          total: data.energy.total,
          unit: '',
        })}
        percentage={energyPercentage}
        trailing={
          <InfoButton onClick={onInfoPress}>
            <InfoCircleIcon style={{ fontSize: 20 }} />
          </InfoButton>
        }
      />
    </HStack>
  )
}
