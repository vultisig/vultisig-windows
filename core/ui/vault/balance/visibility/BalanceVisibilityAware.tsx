import { borderRadius } from '@lib/ui/css/borderRadius'
import { ChildrenProp } from '@lib/ui/props'
import { range } from '@vultisig/lib-utils/array/range'
import styled from 'styled-components'

import { useIsBalanceVisible } from '../../../storage/balanceVisibility'

type BalanceSize = 'm' | 'l' | 'xxxl'

type BalanceVisibilityAwareProps = ChildrenProp & {
  size?: BalanceSize
}

const hiddenContentLength: Record<BalanceSize, number> = {
  m: 4,
  l: 8,
  xxxl: 34,
}

// The design specifies an 8px dot with an 8px gap at the 28px balance size.
// Keeping it a ratio lets the smaller call sites scale down proportionally.
const dotRatio = 8 / 28

const HiddenBalance = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${dotRatio}em;
  vertical-align: middle;
`

const Dot = styled.span`
  flex-shrink: 0;
  width: ${dotRatio}em;
  height: ${dotRatio}em;
  ${borderRadius.pill};
  background-color: currentColor;
`

export const BalanceVisibilityAware = ({
  children,
  size = 'm',
}: BalanceVisibilityAwareProps) => {
  const isVisible = useIsBalanceVisible()

  if (isVisible) {
    return <>{children}</>
  }

  return (
    <HiddenBalance>
      {range(hiddenContentLength[size]).map(key => (
        <Dot key={key} />
      ))}
    </HiddenBalance>
  )
}
