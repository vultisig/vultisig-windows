import { ValueProp } from '@lib/ui/props'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import styled from 'styled-components'

type VultDiscountTierBadgeProps = ValueProp<VultDiscountTier> & {
  size: number
}

/** The round medal of a tier on the tier cards and unlock sheets. */
export const VultDiscountTierBadge = ({
  value,
  size,
}: VultDiscountTierBadgeProps) => (
  <Image
    alt=""
    height={size}
    src={`/core/images/tier-badges/${value}.webp`}
    width={size}
  />
)

const Image = styled.img`
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.25));
  flex-shrink: 0;
`
