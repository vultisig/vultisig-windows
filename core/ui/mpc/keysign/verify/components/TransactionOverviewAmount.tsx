import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { CoinKey, CoinMetadata } from '@core/chain/coin/Coin'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { ReactNode } from 'react'

type OverviewCoin = CoinKey & Pick<CoinMetadata, 'decimals' | 'ticker' | 'logo'>

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
            <HStack alignItems="center" gap={4}>
              <Text as="span" size={17}>
                <MatchQuery
                  value={keysignPayloadQuery}
                  pending={() => <Spinner />}
                  error={() => formatAmount(fallbackAmount)}
                  success={payload =>
                    formatAmount(
                      fromChainAmount(getPayloadAmount(payload), coin.decimals)
                    )
                  }
                />
              </Text>
              <Text as="span" color="shy" size={17}>
                {coin.ticker}
              </Text>
            </HStack>
          </HStack>
        </VStack>
      }
      hoverable={false}
    />
  )
}
