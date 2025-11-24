import { Coin } from '@core/chain/coin/Coin'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { panel } from '@lib/ui/panel/Panel'
import { IsActiveProp, OnClickProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

type Props = {
  isSelected?: boolean
  totalFiatAmount?: number
} & ValueProp<Coin> &
  OnClickProp &
  IsActiveProp

export const ChainOption = ({
  value,
  onClick,
  isSelected,
  totalFiatAmount = 0,
}: Props) => {
  const { chain } = value
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <Container
      isSelected={isSelected}
      tabIndex={0}
      role="button"
      onClick={onClick}
    >
      <HStack alignItems="center" justifyContent="space-between">
        <HStack fullWidth alignItems="center" gap={12}>
          <CoinIcon coin={value} style={{ fontSize: 32 }} />
          <VStack alignItems="start">
            <Text color="contrast" size={14} weight="500">
              {chain}
            </Text>
          </VStack>
        </HStack>

        <Text size={12} color="shy" weight="500">
          {formatFiatAmount(totalFiatAmount)}
        </Text>
      </HStack>
    </Container>
  )
}

const Container = styled('div')<{ isSelected?: boolean }>`
  ${panel()};
  padding: 12px 20px;
  border-radius: 0px;
  position: relative;
  cursor: pointer;
  background: ${({ isSelected }) =>
    getColor(isSelected ? 'foregroundExtra' : 'foreground')};

  &:hover {
    background: ${getColor('foregroundExtra')};
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    width: 320px;
    height: 1px;
    background: linear-gradient(90deg, #061b3a 0%, #284570 49.5%, #061b3a 100%);
    transform: translateX(-50%);
    pointer-events: none;
  }

  &:last-child::after {
    content: none;
  }
`
