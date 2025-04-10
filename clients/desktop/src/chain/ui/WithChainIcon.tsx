import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { getColor } from '@lib/ui/theme/getters'
import { ComponentProps } from 'react'
import styled from 'styled-components'

import { ChainEntityIcon } from './ChainEntityIcon'

const Wrapper = styled.div`
  ${sameDimensions('1em')};
  position: relative;
`

type WithChainIconProps = ComponentProps<typeof Wrapper> & {
  src?: string
}

const Position = styled.div`
  position: absolute;
  bottom: -0.32em;
  right: -0.32em;
  font-size: 0.52em;
  ${round};
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foreground')};
  ${centerContent};
`

export const WithChainIcon = ({
  children,
  src,
  ...rest
}: WithChainIconProps) => {
  return (
    <Wrapper {...rest}>
      {children}
      <Position>
        <ChainEntityIcon value={src} />
      </Position>
    </Wrapper>
  )
}
