import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { Coin } from '@core/chain/coin/Coin'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import {
  useCurrentVaultAddress,
  useCurrentVaultCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { panel } from '@lib/ui/panel/Panel'
import { IsActiveProp, OnClickProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import styled from 'styled-components'

export const CoinOption = ({
  value,
  onClick,
}: ValueProp<Coin> & OnClickProp & IsActiveProp) => {
  const { chain, ticker, decimals } = value
  const address = useCurrentVaultAddress(chain)
  const coins = useCurrentVaultCoins()
  const coin = coins.find(c => c.chain === chain && c.id === value.id) ?? {
    ...value,
    address,
  }
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))
  const priceQuery = useCoinPriceQuery({
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
        <CoinIcon coin={coin} style={{ fontSize: 32 }} />
        <HStack gap={8} alignItems="center">
          <Text color="contrast" size={13} weight="500">
            {ticker}
          </Text>
          <PillWrapper>
            <Text color="shy" size={11} weight="500">
              {chain}
            </Text>
          </PillWrapper>
        </HStack>
      </HStack>
      <VStack
        gap={4}
        justifyContent="center"
        alignItems="flex-end"
        style={{
          minWidth: 100,
          height: 50,
        }}
      >
        <MatchQuery
          value={balanceQuery}
          pending={() => (
            <VStack gap={6} fullHeight fullWidth>
              <VStack flexGrow>
                <Skeleton />
              </VStack>
              <VStack flexGrow>
                <Skeleton />
              </VStack>
            </VStack>
          )}
          success={balance => (
            <VStack gap={6}>
              <VStack flexGrow alignItems="flex-end">
                <Text
                  style={{
                    textAlign: 'right',
                  }}
                  as="span"
                  size={12}
                  color="contrast"
                  weight={500}
                >
                  {formatTokenAmount(fromChainAmount(balance, decimals))}
                  {` ${ticker}`}
                </Text>
              </VStack>
              <VStack flexGrow alignItems="flex-end">
                <MatchQuery
                  value={priceQuery}
                  pending={() => <Skeleton />}
                  success={price => (
                    <Text as="span" size={12} color="shy" weight={500}>
                      {formatFiatAmount(
                        fromChainAmount(balance, decimals) * price
                      )}
                    </Text>
                  )}
                />
              </VStack>
            </VStack>
          )}
        />
      </VStack>
    </Container>
  )
}

const Container = styled(HStack)`
  ${panel()};
  padding: 12px 20px;
  border-radius: 0px;
  position: relative;
  background-color: ${getColor('foreground')};
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    width: 320px;
    height: 1px;
    background: linear-gradient(90deg, #061b3a 0%, #284570 49.5%, #061b3a 100%);
    transform: translateX(-50%);
    pointer-events: none;
  }

  &:last-child::after {
    content: none;
  }
`

const PillWrapper = styled.div`
  display: grid;
  place-items: center;
  padding: 8px 12px;
  border-radius: 99px;
  border: 1px solid ${getColor('foregroundExtra')};
`
