import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useState } from 'react'
import styled from 'styled-components'

import { useKeybaseAvatarQuery } from '../keybase/useKeybaseAvatarQuery'

type ValidatorAvatarProps = {
  moniker: string
  /**
   * Keybase identity (the `description.identity` field on the validator;
   * 16-hex PGP key fingerprint suffix). When present, we resolve a Keybase
   * profile picture in the background and swap it in. When absent or the
   * lookup fails, the deterministic initial avatar stays.
   */
  identity?: string
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

export const ValidatorAvatar = ({
  moniker,
  identity,
  size = 36,
}: ValidatorAvatarProps) => {
  const initial = (moniker.trim()[0] ?? '?').toUpperCase()
  const bg = colorByLetter[initial.toLowerCase()] ?? '#7C8FFF'
  const keybaseQuery = useKeybaseAvatarQuery(identity)
  // `<img>` can still 404 after Keybase says the URL exists — track that
  // separately so we drop back to the initial avatar without re-querying.
  const [imageBroken, setImageBroken] = useState(false)

  const avatarUrl = keybaseQuery.data
  const showImage =
    Boolean(avatarUrl) && !imageBroken && !keybaseQuery.isPending

  return (
    <Circle $size={size} $bg={bg}>
      {showImage ? (
        <AvatarImage
          src={avatarUrl as string}
          alt={moniker}
          width={size}
          height={size}
          onError={() => setImageBroken(true)}
          loading="lazy"
        />
      ) : (
        <Initial size={Math.floor(size / 2.4)}>{initial}</Initial>
      )}
    </Circle>
  )
}

const Circle = styled(HStack)<{ $size: number; $bg: string }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
`

const Initial = styled(Text)`
  color: ${getColor('background')};
  font-weight: 600;
`

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`
