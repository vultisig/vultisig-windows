import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { OnCloseProp, TitleProp } from '@lib/ui/props'
import { Sheet } from '@lib/ui/sheet/Sheet'
import { getColor } from '@lib/ui/theme/getters'
import { match } from '@vultisig/lib-utils/match'
import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

import { BlockaidLogomark } from '../../../chain/security/blockaid/BlockaidLogomark'

/**
 * What the badge's ring says about the transaction's Blockaid scan: it came
 * back clean, flagged as risky, or flagged as malicious. Without a verdict
 * (scan off, running, failed or not applicable) the ring stays off.
 */
export type ReviewBadgeTone = 'safe' | 'warning' | 'danger'

const Badge = styled.div<{ $tone?: ReviewBadgeTone }>`
  ${sameDimensions(32)};
  ${centerContent};
  ${borderRadius.pill};
  background: ${getColor('foregroundSuper')};
  color: ${getColor('contrast')};
  font-size: 14px;

  ${({ $tone }) =>
    $tone &&
    css`
      border: 1px solid
        ${match($tone, {
          safe: () => getColor('success'),
          warning: () => getColor('idle'),
          danger: () => getColor('danger'),
        })};
    `}
`

type ReviewSheetProps = OnCloseProp &
  TitleProp & {
    children: ReactNode
    footer?: ReactNode
    badgeTone?: ReviewBadgeTone
  }

/**
 * The sheet every transaction is reviewed on before signing: the Blockaid
 * badge in the header (ringed in the colour of the scan's verdict), the flow's
 * summary in the body and the sign controls pinned at the bottom. Closing it
 * returns to the form it was opened from.
 */
export const ReviewSheet = ({
  title,
  children,
  footer,
  badgeTone,
  onClose,
}: ReviewSheetProps) => (
  <Sheet
    title={title}
    onClose={onClose}
    leading={
      <Badge $tone={badgeTone}>
        <BlockaidLogomark />
      </Badge>
    }
    footer={footer}
  >
    {children}
  </Sheet>
)
