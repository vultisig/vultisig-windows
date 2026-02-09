import { TronResourceType } from '@core/chain/chains/tron/resources'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

type TronResourceTypePickerProps = {
  value: TronResourceType
  onChange: (value: TronResourceType) => void
}

const resourceTypes: TronResourceType[] = ['BANDWIDTH', 'ENERGY']

export const TronResourceTypePicker = ({
  value,
  onChange,
}: TronResourceTypePickerProps) => {
  const { t } = useTranslation()

  const labels: Record<TronResourceType, string> = {
    BANDWIDTH: t('tron_bandwidth'),
    ENERGY: t('tron_energy'),
  }

  return (
    <Container>
      {resourceTypes.map(type => (
        <Option
          key={type}
          $active={value === type}
          onClick={() => onChange(type)}
        >
          <Text
            color={value === type ? 'contrast' : 'shy'}
            size={14}
            weight="600"
          >
            {labels[type]}
          </Text>
        </Option>
      ))}
    </Container>
  )
}

const Container = styled(HStack)`
  border-radius: 8px;
  background: ${getColor('foreground')};
  padding: 2px;
  gap: 2px;
`

const Option = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.foregroundExtra.toCssValue() : 'transparent'};
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
  }
`
