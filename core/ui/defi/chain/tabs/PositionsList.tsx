import { DefiPosition } from '@core/ui/storage/defiPositions'
import { List } from '@lib/ui/list'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

type PositionsListProps = {
  positions: DefiPosition[]
}

export const PositionsList = ({ positions }: PositionsListProps) => {
  return (
    <List>
      {positions.map(position => (
        <PositionItem key={position.id}>
          <PositionIcon>
            <Text size={14} weight="600">
              {position.ticker.charAt(0)}
            </Text>
          </PositionIcon>
          <PositionInfo>
            <Text size={14} weight="500">
              {position.name}
            </Text>
            <Text size={12} color="shy">
              {/* TODO: Add actual balance */}
              $0.00
            </Text>
          </PositionInfo>
        </PositionItem>
      ))}
    </List>
  )
}

const PositionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: ${getColor('foreground')};
  border-radius: 12px;
`

const PositionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${getColor('foregroundExtra')};
  display: flex;
  align-items: center;
  justify-content: center;
`

const PositionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`
