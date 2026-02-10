import { toPercents } from '@lib/utils/toPercents'
import styled from 'styled-components'

type TronResourceBarProps = {
  $percentage: number
  $color: string
}

const Track = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 12px;
  background: #11284a;
  overflow: hidden;
`

const Fill = styled.div<TronResourceBarProps>`
  height: 100%;
  border-radius: 12px;
  background: linear-gradient(90deg, ${({ $color }) => $color}, #11284a);
  width: ${({ $percentage }) =>
    toPercents(Math.max(Math.min($percentage, 1), 0))};
  transition: width 0.3s ease;
`

export const TronResourceBar = ({
  percentage,
  color,
}: {
  percentage: number
  color: string
}) => (
  <Track>
    <Fill $percentage={percentage} $color={color} />
  </Track>
)
