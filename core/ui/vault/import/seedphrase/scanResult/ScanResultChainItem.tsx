import { Chain } from '@core/chain/Chain'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { hStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import styled from 'styled-components'

const Container = styled(Panel)`
  padding: 20px 16px;
  border-radius: 20px;
  ${hStack({
    gap: 10,
    alignItems: 'center',
  })};
`

export const ScanResultChainItem = ({ value }: ValueProp<Chain>) => (
  <Container>
    <ChainEntityIcon value={getChainLogoSrc(value)} style={{ fontSize: 36 }} />
    <Text color="contrast" size={14} weight={500}>
      {value}
    </Text>
  </Container>
)
