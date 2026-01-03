import { Chain } from '@core/chain/Chain'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { HStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import styled from 'styled-components'

const Container = styled(Panel)`
  padding: 12px 16px 12px 12px;
`

export const ScanResultChainItem = ({ value }: ValueProp<Chain>) => (
  <Container>
    <HStack fullWidth alignItems="center" gap={4}>
      <ChainEntityIcon
        value={getChainLogoSrc(value)}
        style={{ fontSize: 36 }}
      />
      <Text color="contrast" size={14} weight={500}>
        {value}
      </Text>
    </HStack>
  </Container>
)
