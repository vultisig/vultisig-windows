import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { Coin } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { ChainCoinIcon } from '@core/ui/chain/coin/icon/ChainCoinIcon'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { shouldDisplayChainLogo } from '@core/ui/chain/coin/icon/utils/shouldDisplayChainLogo'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { panel } from '@lib/ui/panel/Panel'
import { IsActiveProp, OnClickProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import styled from 'styled-components'

import { getChainLogoSrc } from '../../metadata/getChainLogoSrc'

export const CoinOption = ({
  value,
  onClick,
}: ValueProp<Coin> & OnClickProp & IsActiveProp) => {
  const { chain, logo, ticker, id, decimals } = value
  const coin = useCurrentVaultCoin(value)
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
        <ChainCoinIcon
          coinSrc={logo ? getCoinLogoSrc(logo) : undefined}
          chainSrc={
            shouldDisplayChainLogo({
              ticker,
              chain,
              isNative: isFeeCoin({ id, chain }),
            })
              ? getChainLogoSrc(chain)
              : undefined
          }
          style={{ fontSize: 32 }}
        />
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
  cursor: pointer;
  border-bottom: 1px solid ${getColor('foregroundExtra')};
`

const PillWrapper = styled.div`
  display: grid;
  place-items: center;
  padding: 8px 12px;
  border-radius: 99px;
  border: 1px solid ${getColor('foregroundExtra')};
`
