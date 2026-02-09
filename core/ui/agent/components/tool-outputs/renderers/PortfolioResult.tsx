import { Chain } from '@core/chain/Chain'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { FC } from 'react'
import styled from 'styled-components'

type CoinEntry = {
  chain: string
  ticker: string
  balance: string
  value_usd: number
  price_usd: number
  logo?: string
  balance_error?: string
}

type ChainEntry = {
  chain: string
  value_usd: number
}

type PortfolioData = {
  total_value_usd: number
  chains?: ChainEntry[]
  coins?: CoinEntry[]
}

type Props = {
  data: unknown
}

const isPortfolioData = (data: unknown): data is PortfolioData => {
  if (typeof data !== 'object' || data === null) return false
  return 'total_value_usd' in data
}

const formatUSD = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  }
  if (value >= 1000) {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${value.toFixed(2)}`
}

const getChainFromString = (chainStr: string): Chain | null => {
  const chainValues = Object.values(Chain)
  const found = chainValues.find(
    c => c.toLowerCase() === chainStr.toLowerCase()
  )
  return found ?? null
}

export const PortfolioResult: FC<Props> = ({ data }) => {
  if (!isPortfolioData(data)) {
    return null
  }

  const chains = data.chains ?? []
  const coins = data.coins ?? []

  const sortedChains = [...chains].sort((a, b) => b.value_usd - a.value_usd)
  const sortedCoins = [...coins].sort((a, b) => b.value_usd - a.value_usd)

  return (
    <Container>
      <VStack gap={0}>
        <TotalSection>
          <Text size={12} color="shy" weight={500}>
            Total Portfolio Value
          </Text>
          <Text size={28} weight={700} color="regular">
            {formatUSD(data.total_value_usd)}
          </Text>
        </TotalSection>

        {sortedChains.length > 0 && (
          <>
            <SectionHeader>
              <Text size={12} weight={600} color="supporting">
                By Chain
              </Text>
            </SectionHeader>
            {sortedChains.map(chain => {
              const pct =
                data.total_value_usd > 0
                  ? (chain.value_usd / data.total_value_usd) * 100
                  : 0
              return (
                <ChainRow key={chain.chain}>
                  <HStack
                    gap={8}
                    alignItems="center"
                    justifyContent="space-between"
                    fullWidth
                  >
                    <HStack gap={8} alignItems="center">
                      <Text size={13} color="regular" weight={500}>
                        {chain.chain}
                      </Text>
                      <Text size={11} color="shy">
                        {pct.toFixed(1)}%
                      </Text>
                    </HStack>
                    <Text size={13} color="regular" weight={600}>
                      {formatUSD(chain.value_usd)}
                    </Text>
                  </HStack>
                </ChainRow>
              )
            })}
          </>
        )}

        {sortedCoins.length > 0 && (
          <>
            <SectionHeader>
              <Text size={12} weight={600} color="supporting">
                Assets ({sortedCoins.length})
              </Text>
            </SectionHeader>
            {sortedCoins.map((coin, index) => {
              const chain = getChainFromString(coin.chain)
              const coinKey = chain
                ? { chain, id: coin.ticker }
                : null

              return (
                <CoinRow key={index}>
                  <HStack gap={12} alignItems="center" fullWidth>
                    {coinKey && (
                      <CoinIconContainer>
                        <CoinIcon
                          coin={{ ...coinKey, logo: coin.logo || '' }}
                        />
                      </CoinIconContainer>
                    )}
                    <VStack gap={2} style={{ flex: 1 }}>
                      <HStack
                        gap={8}
                        alignItems="center"
                        justifyContent="space-between"
                        fullWidth
                      >
                        <HStack gap={6} alignItems="center">
                          <Text size={14} weight={600} color="regular">
                            {coin.ticker}
                          </Text>
                          <ChainBadge>
                            <Text size={10} color="supporting">
                              {coin.chain}
                            </Text>
                          </ChainBadge>
                        </HStack>
                        <Text size={14} weight={600} color="regular">
                          {formatUSD(coin.value_usd)}
                        </Text>
                      </HStack>
                      <HStack
                        alignItems="center"
                        justifyContent="space-between"
                        fullWidth
                      >
                        <Text size={12} color="shy">
                          {coin.balance} {coin.ticker}
                        </Text>
                        {coin.price_usd > 0 && (
                          <Text size={11} color="shy">
                            @ {formatUSD(coin.price_usd)}
                          </Text>
                        )}
                      </HStack>
                    </VStack>
                  </HStack>
                </CoinRow>
              )
            })}
          </>
        )}
      </VStack>
    </Container>
  )
}

const Container = styled.div`
  background: ${getColor('foreground')};
  border-radius: 8px;
  border: 1px solid ${getColor('mist')};
  overflow: hidden;
`

const TotalSection = styled.div`
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid ${getColor('mist')};
`

const SectionHeader = styled.div`
  padding: 10px 16px;
  border-bottom: 1px solid ${getColor('mist')};
  background: ${getColor('background')};
`

const ChainRow = styled.div`
  padding: 10px 16px;
  border-bottom: 1px solid ${getColor('mist')};

  &:last-child {
    border-bottom: none;
  }
`

const CoinRow = styled.div`
  padding: 10px 16px;
  border-bottom: 1px solid ${getColor('mist')};

  &:last-child {
    border-bottom: none;
  }
`

const CoinIconContainer = styled.div`
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ChainBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
`
