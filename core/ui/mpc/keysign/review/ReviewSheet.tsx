import { ProductLogo } from '@core/ui/product/ProductLogo'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { OnCloseProp, TitleProp } from '@lib/ui/props'
import { Sheet } from '@lib/ui/sheet/Sheet'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

const LogoBadge = styled.div`
  ${sameDimensions(32)};
  ${centerContent};
  ${borderRadius.pill};
  background: ${getColor('textShyExtra')};
  color: ${getColor('background')};
  font-size: 18px;
`

type ReviewSheetProps = OnCloseProp &
  TitleProp & {
    children: ReactNode
    footer?: ReactNode
  }

/**
 * The sheet every transaction is reviewed on before signing: the product mark
 * in the header, the flow's summary in the body and the sign controls pinned
 * at the bottom. Closing it returns to the form it was opened from.
 */
export const ReviewSheet = ({
  title,
  children,
  footer,
  onClose,
}: ReviewSheetProps) => (
  <Sheet
    title={title}
    onClose={onClose}
    leading={
      <LogoBadge>
        <ProductLogo />
      </LogoBadge>
    }
    footer={footer}
  >
    {children}
  </Sheet>
)
