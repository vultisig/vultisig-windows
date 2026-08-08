import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { CoinKey, CoinMetadata } from '@vultisig/core-chain/coin/Coin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { ReactNode } from 'react'

import { TransactionOverviewFiatAmount } from './TransactionOverviewFiatAmount'

type OverviewCoin = CoinKey & Pick<CoinMetadata, 'decimals' | 'ticker' | 'logo'>

type HeroAmountProps = {
  coin: OverviewCoin
  amount: number
  highPrecision?: boolean
}

const HeroAmount = ({ coin, amount, highPrecision }: HeroAmountProps) => (
  <VStack gap={2}>
    <HStack alignItems="center" gap={4}>
      <Text as="span" size={17}>
        {formatAmount(
          amount,
          highPrecision ? { precision: 'high' } : undefined
        )}
      </Text>
      <Text as="span" color="shy" size={17}>
        {coin.ticker}
      </Text>
    </HStack>
    <TransactionOverviewFiatAmount coin={coin} amount={amount} />
  </VStack>
)

type TransactionOverviewAmountProps = {
  label: ReactNode
  coin: OverviewCoin
  fallbackAmount: number
  keysignPayloadQuery: Query<KeysignPayload>
  getPayloadAmount?: (payload: KeysignPayload) => bigint | number | string
}

export const TransactionOverviewAmount = ({
  label,
  coin,
  fallbackAmount,
  keysignPayloadQuery,
  getPayloadAmount = payload => payload.toAmount,
}: TransactionOverviewAmountProps) => {
  return (
    <ListItem
      title={
        <VStack gap={24}>
          <Text
            as="span"
            color="shyExtra"
            size={15}
            weight={500}
            style={{
              fontFamily: 'Brockmann, sans-serif',
              lineHeight: '17px',
              letterSpacing: '-0.18px',
              color: '#C9D6E8',
            }}
          >
            {label}
          </Text>
          <HStack alignItems="center" gap={8}>
            <CoinIcon coin={coin} style={{ fontSize: 24 }} />
            <MatchQuery
              value={keysignPayloadQuery}
              pending={() => <Spinner />}
              error={() => <HeroAmount coin={coin} amount={fallbackAmount} />}
              success={payload => (
                <HeroAmount
                  coin={coin}
                  amount={fromChainAmount(
                    getPayloadAmount(payload),
                    coin.decimals
                  )}
                  highPrecision
                />
              )}
            />
          </HStack>
        </VStack>
      }
      hoverable={false}
    />
  )
}
