import { getColor } from '@lib/ui/theme/getters'
import { useState } from 'react'
import styled from 'styled-components'

type SolanaValidatorAvatarProps = {
  name: string
  logoUrl?: string
  size?: number
}

/**
 * Validator avatar for the Solana picker / rows. Renders the metadata logo when
 * present (and it loads), otherwise a deterministic monogram circle from the
 * first character of the display name. Mirrors iOS `SolanaValidatorCard`'s
 * avatar fallback.
 */
export const SolanaValidatorAvatar = ({
  name,
  logoUrl,
  size = 36,
}: SolanaValidatorAvatarProps) => {
  const [failed, setFailed] = useState(false)

  if (logoUrl && !failed) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        $size={size}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <Monogram $size={size}>{(name.trim()[0] ?? '?').toUpperCase()}</Monogram>
  )
}

const Image = styled.img<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`

const Monogram = styled.div<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ $size }) => Math.round($size * 0.42)}px;
  font-weight: 600;
  color: ${getColor('text')};
  background: ${getColor('foregroundExtra')};
`
