import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { HStack } from '@lib/ui/layout/Stack'
import { panel } from '@lib/ui/panel/Panel'
import { OnClickProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

type ChainOptionProps = OnClickProp & {
  icon: ReactNode
  name: string
  totalFiatAmount: number
  isSelected: boolean
  'data-testid': string
}

/**
 * A chain to filter the send asset list by, with the fiat value it holds. The
 * current filter takes a stronger background than hover.
 */
export const ChainOption = ({
  icon,
  name,
  totalFiatAmount,
  isSelected,
  ...rest
}: ChainOptionProps) => {
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <Container
      type="button"
      role="option"
      aria-selected={isSelected}
      $isSelected={isSelected}
      {...rest}
    >
      <ChainDetails alignItems="center" gap={12}>
        {icon}
        <Text color="contrast" size={14} weight="500" cropped>
          {name}
        </Text>
      </ChainDetails>
      <Text size={12} color="shy" weight="500" nowrap>
        {formatFiatAmount(totalFiatAmount)}
      </Text>
    </Container>
  )
}

/**
 * `width: 100%` alone makes this a flex item that will not shrink below the
 * whole row, so the balance beside it pushed the row 8px wider than the list
 * and the list turned that into a horizontal scrollbar.
 */
const ChainDetails = styled(HStack)`
  min-width: 0;
  font-size: 32px;
`

const Container = styled.button<{ $isSelected: boolean }>`
  ${panel()};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 0;
  position: relative;
  cursor: pointer;
  text-align: left;
  color: inherit;
  font: inherit;
  background: ${({ $isSelected }) =>
    getColor($isSelected ? 'foregroundExtra' : 'foreground')};

  &:focus-visible {
    outline: none;
  }

  &:not([aria-selected='true']):hover,
  &:not([aria-selected='true']):focus-visible {
    background: ${getColor('foregroundDark')};
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    width: min(320px, 100%);
    height: 1px;
    background: linear-gradient(90deg, #061b3a 0%, #284570 49.5%, #061b3a 100%);
    transform: translateX(-50%);
    pointer-events: none;
  }

  &:last-child::after {
    content: none;
  }
`
