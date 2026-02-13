import {
  formatTronResourceValue,
  TronAccountResources,
} from '@core/chain/chains/tron/resources'
import { InfoCircleIcon } from '@lib/ui/icons/InfoCircleIcon'
import { TronBandwidthIcon } from '@lib/ui/icons/TronBandwidthIcon'
import { TronEnergyIcon } from '@lib/ui/icons/TronEnergyIcon'
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

const Card = styled(VStack)`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('background')};
  gap: 16px;
`

const BandwidthIconBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  background: rgba(19, 200, 157, 0.1);
  flex-shrink: 0;
`

const EnergyIconBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  background: #1b2430;
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
  title: string
  value: string
  percentage: number
  trailing?: ReactNode
}

const ResourceCardItem: FC<ResourceCardItemProps> = ({
  icon,
  accentColor,
  title,
  value,
  percentage,
  trailing,
}) => (
  <Card>
    <HStack gap={8} alignItems="center">
      {icon}
      <VStack gap={2} style={{ flex: 1 }}>
        <Text style={{ color: accentColor }} size={15} weight="500">
          {title}
        </Text>
        <Text color="shyExtra" size={12} weight="500">
          {value}
        </Text>
      </VStack>
      {trailing}
    </HStack>
    <TronResourceBar percentage={percentage} color={accentColor} />
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
          <BandwidthIconBox>
            <TronBandwidthIcon
              style={{ fontSize: 16, color: bandwidthAccent }}
            />
          </BandwidthIconBox>
        }
        accentColor={bandwidthAccent}
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
          <EnergyIconBox>
            <TronEnergyIcon style={{ fontSize: 16, color: energyAccent }} />
          </EnergyIconBox>
        }
        accentColor={energyAccent}
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
