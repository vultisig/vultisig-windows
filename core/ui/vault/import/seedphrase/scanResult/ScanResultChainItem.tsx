import { Chain } from '@core/chain/Chain'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { hStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

const Container = styled.div`
  height: 52px;
  border-radius: 20px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
  ${hStack({
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  })};
  font-size: 14px;
`

export const ScanResultChainItem = ({ value }: ValueProp<Chain>) => (
  <Container>
    <ChainEntityIcon value={getChainLogoSrc(value)} style={{ fontSize: 25 }} />
    {value}
  </Container>
)
