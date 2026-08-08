import styled from 'styled-components'

import { TierBadgeContent } from './useTierBadge'

type TierBadgeProps = {
  badge: TierBadgeContent | null
}

/**
 * Pill rendered next to a tier-gated trigger, showing the user's current tier
 * or the tier required to unlock the perk. Renders nothing while the tier is
 * still being resolved (`badge` is `null`).
 */
export const TierBadge = ({ badge }: TierBadgeProps) =>
  badge ? <Pill $color={badge.color}>{badge.label}</Pill> : null

const Pill = styled.span<{ $color: string }>`
  border: 1px solid ${({ $color }) => $color};
  border-radius: 99px;
  color: ${({ $color }) => $color};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 2px 8px;
`
