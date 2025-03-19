import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { Coin } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import styled from 'styled-components'

import { ChainCoinIcon } from '../../../chain/ui/ChainCoinIcon'
import { useFormatFiatAmount } from '../../../chain/ui/hooks/useFormatFiatAmount'
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc'
import { HStack, VStack } from '../../../lib/ui/layout/Stack'
import { panel } from '../../../lib/ui/panel/Panel'
import { IsActiveProp, OnClickProp, ValueProp } from '../../../lib/ui/props'
import { Text } from '../../../lib/ui/text'
import { getColor } from '../../../lib/ui/theme/getters'
import { shouldDisplayChainLogo } from '../../../vault/chain/utils'
import { useCurrentVaultCoin } from '../../../vault/state/currentVault'
import { getCoinLogoSrc } from '../../logo/getCoinLogoSrc'
import { useBalanceQuery } from '../../query/useBalanceQuery'
import { useCoinPriceQuery } from '../../query/useCoinPriceQuery'

const Container = styled(HStack)`
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
  const { chain, logo, ticker, id, decimals } = value
  const coin = useCurrentVaultCoin(value)
  const { data: balance } = useBalanceQuery(extractAccountCoinKey(coin))
  const { data: price } = useCoinPriceQuery({
    coin,
  })
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <Container
      fullWidth
      tabIndex={0}
      role="button"
      onClick={onClick}
      justifyContent="space-between"
      alignItems="center"
    >
      <HStack alignItems="center" gap={12}>
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
        <VStack gap={2}>
          <Text color="contrast" size={13} weight="500">
            {ticker}
          </Text>
          <Text color="shy" size={11} weight="500">
            {chain}
          </Text>
        </VStack>
      </HStack>
      <VStack gap={4} justifyContent="center" alignItems="flex-end">
        <Text size={12} color="contrast" weight={500}>
          {formatTokenAmount(fromChainAmount(balance ?? 0, decimals))}
          {` ${ticker}`}
        </Text>
        <Text size={12} color="shy" weight={500}>
          {formatFiatAmount(Number(balance) * (price ?? 0))}
        </Text>
      </VStack>
    </Container>
  )
}
