import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { getColor } from '@lib/ui/theme/getters'
import { Chain } from '@vultisig/core-chain/Chain'
import { ComponentProps } from 'react'
import styled from 'styled-components'

import { getChainMonoLogoSrc } from '../../metadata/getChainMonoLogoSrc'

const Wrapper = styled.div`
  ${sameDimensions('1em')};
  position: relative;
`

type WithChainIconProps = ComponentProps<typeof Wrapper> & {
  chain: Chain
}

const Position = styled.div`
  position: absolute;
  bottom: -0.32em;
  right: -0.32em;
  font-size: 0.52em;
  ${borderRadius.pill};
  background-color: ${getColor('white')};
  border: 1px solid ${getColor('foregroundExtra')};
  ${centerContent};
`

/**
 * Overlays a chain badge on the bottom-right of a coin icon. The badge always
 * resolves the chain's mono mark, so a full-colour logo cannot leak into it
 * from a call site.
 */
export const WithChainIcon = ({
  children,
  chain,
  ...rest
}: WithChainIconProps) => {
  return (
    <Wrapper {...rest}>
      {children}
      <Position>
        <ChainEntityIcon value={getChainMonoLogoSrc(chain)} />
      </Position>
    </Wrapper>
  )
}
