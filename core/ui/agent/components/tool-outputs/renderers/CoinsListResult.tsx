import { Chain } from '@core/chain/Chain'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { FC } from 'react'
import styled from 'styled-components'

import { CopyButton } from '../CopyButton'
import { ResultPanel } from '../ResultPanel'
import { ResultRow } from '../ResultRow'

type CoinItem = {
  ticker: string
  chain: string
  contractAddress?: string
  contract_address?: string
  decimals?: number
  logo?: string
  isNative?: boolean
  is_native?: boolean
  balance?: string
  balance_error?: string
}

type CoinsListData = {
  coins?: CoinItem[]
}

type Props = {
  data: unknown
}

const isCoinsListData = (data: unknown): data is CoinsListData => {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  if (!Array.isArray(obj.coins)) return false
  return obj.coins.every(
    (item: unknown) =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as CoinItem).ticker === 'string' &&
      typeof (item as CoinItem).chain === 'string'
  )
}

const getChainFromString = (chainStr: string): Chain | null => {
  const chainValues = Object.values(Chain)
  const found = chainValues.find(
    c => c.toLowerCase() === chainStr.toLowerCase()
  )
  return found ?? null
}

export const CoinsListResult: FC<Props> = ({ data }) => {
  if (!isCoinsListData(data) || !data.coins) {
    return null
  }

  return (
    <ResultPanel title="Your Coins" count={data.coins.length}>
      {data.coins.map((coin, index) => {
        const chain = getChainFromString(coin.chain)
        const contractAddress = coin.contractAddress || coin.contract_address
        const isNative = coin.isNative ?? coin.is_native
        const coinKey = chain
          ? { chain, id: contractAddress || coin.ticker }
          : null

        return (
          <ResultRow
            key={index}
            icon={
              coinKey && (
                <CoinIconContainer>
                  <CoinIcon coin={{ ...coinKey, logo: coin.logo || '' }} />
                </CoinIconContainer>
              )
            }
            extra={
              contractAddress && (
                <CopyButton value={contractAddress} label="Address copied" />
              )
            }
          >
            <VStack gap={2}>
              <HStack gap={8} alignItems="center">
                <Text size={14} weight={600} color="regular">
                  {coin.ticker}
                </Text>
                <ChainBadge>
                  <Text size={11} color="supporting">
                    {coin.chain}
                  </Text>
                </ChainBadge>
              </HStack>
              <HStack gap={8} alignItems="center">
                {isNative || !contractAddress ? (
                  <Text size={12} color="shy">
                    Native token
                  </Text>
                ) : (
                  <MiddleTruncate
                    text={contractAddress}
                    color="textShy"
                    size={12}
                    width={120}
                  />
                )}
                {coin.balance && (
                  <Text size={11} color="supporting">
                    Balance: {coin.balance}
                  </Text>
                )}
                {coin.balance_error && (
                  <Text size={11} color="danger">
                    Balance unavailable
                  </Text>
                )}
                {coin.decimals !== undefined && (
                  <Text size={11} color="shy">
                    {coin.decimals} decimals
                  </Text>
                )}
              </HStack>
            </VStack>
          </ResultRow>
        )
      })}
    </ResultPanel>
  )
}

const CoinIconContainer = styled.div`
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const ChainBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
`
