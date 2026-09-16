import { MergeRefs } from '@lib/ui/base/MergeRefs'
import { useElementSize } from '@lib/ui/hooks/useElementSize'
import { Text, TextColor } from '@lib/ui/text'
import { Tooltip } from '@lib/ui/tooltips/Tooltip'
import { CSSProperties, useState } from 'react'
import styled from 'styled-components'

/**
 * A contract-address ticker has no spaces to break on, so it needs both an
 * explicit break and a width — left alone the tooltip stretches past the popup.
 */
const FullTicker = styled.span`
  display: block;
  max-width: 240px;
  word-break: break-all;
`

type CoinTickerProps = {
  ticker: string
  size?: number
  weight?: CSSProperties['fontWeight']
  color?: TextColor
  maxWidth?: number
}

/**
 * Renders a coin ticker/name truncated with an ellipsis so long values (e.g. a
 * raw contract address used as a token name) never break the surrounding
 * layout, regardless of the available width. When the value is actually
 * truncated, the full name is shown on hover via a tooltip.
 */
export const CoinTicker = ({
  ticker,
  size = 14,
  weight,
  color = 'contrast',
  maxWidth = 180,
}: CoinTickerProps) => {
  const [element, setElement] = useState<HTMLParagraphElement | null>(null)
  const elementSize = useElementSize(element)

  const isTruncated =
    !!element && !!elementSize && element.scrollWidth > element.clientWidth

  return (
    <Tooltip
      content={isTruncated ? <FullTicker>{ticker}</FullTicker> : undefined}
      renderOpener={({ ref, ...props }) => (
        <MergeRefs<HTMLParagraphElement>
          refs={[ref, setElement]}
          render={mergedRef => (
            <Text
              ref={mergedRef}
              cropped
              color={color}
              size={size}
              weight={weight}
              style={{ maxWidth }}
              {...props}
            >
              {ticker}
            </Text>
          )}
        />
      )}
    />
  )
}
