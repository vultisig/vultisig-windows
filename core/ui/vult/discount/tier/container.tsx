import { VultDiscountTier } from '@core/chain/swap/affiliate/config'
import { ValueProp } from '@lib/ui/props'
import styled from 'styled-components'

type TierStyles = {
  background: string
  borderBottom: string
  boxShadow: string
}

const tierStyles: Record<VultDiscountTier, TierStyles> = {
  bronze: {
    background: `radial-gradient(77.32% 73.64% at 57.64% 132.91%, rgba(219, 87, 39, 0.40) 0%, rgba(6, 27, 58, 0.00) 100%),
      linear-gradient(218deg, rgba(6, 27, 58, 0.00) 55%, rgba(219, 87, 39, 0.40) 104.56%),
      linear-gradient(164deg, rgba(6, 27, 58, 0.00) 47.12%, rgba(219, 87, 39, 0.40) 126.16%),
      linear-gradient(0deg, rgba(6, 27, 58, 0.50) 0%, rgba(6, 27, 58, 0.50) 100%), #061B3A`,
    borderBottom: '2px solid rgba(51, 119, 217, 0.21)',
    boxShadow: '0 4px 16.6px 0 rgba(219, 87, 39, 0.07) inset',
  },
  silver: {
    background: `linear-gradient(204deg, rgba(6, 27, 58, 0.00) 42.72%, rgba(201, 214, 232, 0.40) 122.24%),
      radial-gradient(77.52% 74.04% at 54.43% 138.19%, rgba(201, 214, 232, 0.40) 0%, rgba(6, 27, 58, 0.00) 100%),
      linear-gradient(164deg, rgba(6, 27, 58, 0.00) 47.12%, rgba(201, 214, 232, 0.40) 126.16%),
      linear-gradient(0deg, rgba(6, 27, 58, 0.50) 0%, rgba(6, 27, 58, 0.50) 100%), #061B3A`,
    borderBottom: '2px solid rgba(51, 119, 217, 0.22)',
    boxShadow: '0 4px 16.6px 0 rgba(201, 214, 232, 0.14) inset',
  },
  gold: {
    background: `radial-gradient(89.11% 84.51% at 72.66% 127.89%, rgba(255, 194, 92, 0.60) 0%, rgba(6, 27, 58, 0.00) 100%),
      linear-gradient(204deg, rgba(6, 27, 58, 0.00) 42.72%, rgba(255, 194, 92, 0.50) 122.24%),
      linear-gradient(164deg, rgba(6, 27, 58, 0.00) 47.12%, rgba(255, 194, 92, 0.50) 126.16%),
      linear-gradient(0deg, rgba(6, 27, 58, 0.50) 0%, rgba(6, 27, 58, 0.50) 100%), #061B3A`,
    borderBottom: '2px solid rgba(51, 119, 217, 0.20)',
    boxShadow: '0 4px 16.6px 0 rgba(255, 194, 92, 0.15) inset',
  },
  platinum: {
    background: `radial-gradient(67.3% 63.79% at 54.43% 117.84%, rgba(51, 230, 191, 0.60) 0%, rgba(6, 27, 58, 0.00) 100%),
      linear-gradient(204deg, rgba(6, 27, 58, 0.00) 42.72%, rgba(51, 230, 191, 0.60) 122.24%),
      linear-gradient(150deg, rgba(6, 27, 58, 0.00) 49.38%, rgba(72, 121, 253, 0.60) 109.62%),
      linear-gradient(0deg, rgba(6, 27, 58, 0.50) 0%, rgba(6, 27, 58, 0.50) 100%), #061B3A`,
    borderBottom: '2px solid #294772',
    boxShadow: '0 8px 26px 0 rgba(19, 200, 157, 0.26) inset',
  },
  diamond: {
    background: `radial-gradient(82.33% 78.08% at 66.75% 125.38%, rgba(0, 204, 255, 0.60) 0%, rgba(6, 27, 58, 0.00) 100%),
      linear-gradient(205deg, rgba(6, 27, 58, 0.00) 35.49%, rgba(151, 71, 255, 0.60) 121.65%),
      linear-gradient(150deg, rgba(6, 27, 58, 0.00) 49.38%, rgba(151, 71, 255, 0.60) 109.62%),
      linear-gradient(0deg, rgba(6, 27, 58, 0.50) 0%, rgba(6, 27, 58, 0.50) 100%), #061B3A`,
    borderBottom: '2px solid #9747FF',
    boxShadow: '0 8px 26px 0 rgba(19, 61, 200, 0.36) inset',
  },
  ultimate: {
    background: `radial-gradient(95.09% 93.37% at 35.96% 118.34%, rgba(255, 194, 92, 0.60) 0%, rgba(6, 27, 58, 0.00) 100%),
      linear-gradient(205deg, rgba(6, 27, 58, 0.00) 35.49%, rgba(72, 121, 253, 0.70) 121.65%),
      linear-gradient(133deg, rgba(6, 27, 58, 0.00) 51.68%, rgba(249, 195, 105, 0.70) 99.67%),
      linear-gradient(0deg, rgba(6, 27, 58, 0.50) 0%, rgba(6, 27, 58, 0.50) 100%), #061B3A`,
    borderBottom: '2px solid #041022',
    boxShadow: '0 8px 26px 0 rgba(240, 212, 100, 0.26) inset',
  },
}

type DiscountTierContainerProps = ValueProp<VultDiscountTier> & {
  $hasUnlockButton?: boolean
}

export const DiscountTierContainer = styled.div<DiscountTierContainerProps>`
  display: flex;
  padding: 16px;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  align-self: stretch;
  border-radius: 16px;

  background: ${({ value }) => tierStyles[value].background};
  border-bottom: ${({ value }) => tierStyles[value].borderBottom};
  box-shadow: ${({ value }) => tierStyles[value].boxShadow};
`
