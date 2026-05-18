import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

type ValidatorAvatarProps = {
  moniker: string
  size?: number
}

const colorByLetter: Record<string, string> = {
  a: '#FF8A80',
  b: '#FF80AB',
  c: '#EA80FC',
  d: '#B388FF',
  e: '#8C9EFF',
  f: '#82B1FF',
  g: '#80D8FF',
  h: '#84FFFF',
  i: '#A7FFEB',
  j: '#B9F6CA',
  k: '#CCFF90',
  l: '#F4FF81',
  m: '#FFFF8D',
  n: '#FFE57F',
  o: '#FFD180',
  p: '#FF9E80',
  q: '#FF5C8D',
  r: '#7C4DFF',
  s: '#536DFE',
  t: '#448AFF',
  u: '#40C4FF',
  v: '#18FFFF',
  w: '#64FFDA',
  x: '#69F0AE',
  y: '#B2FF59',
  z: '#EEFF41',
}

const Circle = styled(HStack)<{ $size: number; $bg: string }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const Initial = styled(Text)`
  color: ${getColor('background')};
  font-weight: 600;
`

export const ValidatorAvatar = ({
  moniker,
  size = 36,
}: ValidatorAvatarProps) => {
  const initial = (moniker.trim()[0] ?? '?').toUpperCase()
  const bg = colorByLetter[initial.toLowerCase()] ?? '#7C8FFF'
  return (
    <Circle $size={size} $bg={bg}>
      <Initial size={Math.floor(size / 2.4)}>{initial}</Initial>
    </Circle>
  )
}
