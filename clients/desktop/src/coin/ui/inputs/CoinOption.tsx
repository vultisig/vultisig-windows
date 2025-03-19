import { Coin } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import styled from 'styled-components'

import { ChainCoinIcon } from '../../../chain/ui/ChainCoinIcon'
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc'
import { HStack, VStack } from '../../../lib/ui/layout/Stack'
import { panel } from '../../../lib/ui/panel/Panel'
import { IsActiveProp, OnClickProp, ValueProp } from '../../../lib/ui/props'
import { Text } from '../../../lib/ui/text'
import { getColor } from '../../../lib/ui/theme/getters'
import { shouldDisplayChainLogo } from '../../../vault/chain/utils'
import { getCoinLogoSrc } from '../../logo/getCoinLogoSrc'

const Container = styled('div')`
  ${panel()};
  padding: 12px 20px;
  border-radius: 0px;
  position: relative;
  cursor: pointer;
  border-bottom: 1px solid ${getColor('foregroundExtra')};

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

export const CoinOption = ({
  value,
  onClick,
}: ValueProp<Coin> & OnClickProp & IsActiveProp) => {
  const { chain, logo, ticker, id } = value

  return (
    <Container tabIndex={0} role="button" onClick={onClick}>
      <HStack fullWidth alignItems="center" gap={12}>
        <ChainCoinIcon
          coinSrc={getCoinLogoSrc(logo)}
          chainSrc={
            shouldDisplayChainLogo({
              ticker,
              chain,
              isNative: isFeeCoin({ id, chain }),
            })
              ? getChainEntityIconSrc(chain)
              : undefined
          }
          style={{ fontSize: 32 }}
        />
        <VStack alignItems="start">
          <Text color="contrast" size={14} weight="500">
            {ticker}
          </Text>
        </VStack>
      </HStack>
    </Container>
  )
}
