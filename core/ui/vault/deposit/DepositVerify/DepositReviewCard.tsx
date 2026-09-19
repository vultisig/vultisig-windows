import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { ReviewCard } from '@core/ui/mpc/keysign/review/ReviewCard'
import { TransactionOverviewFiatAmount } from '@core/ui/mpc/keysign/verify/components/TransactionOverviewFiatAmount'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { CoinKey, CoinMetadata } from '@vultisig/core-chain/coin/Coin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { ReactNode } from 'react'

type DepositCoin = CoinKey & Pick<CoinMetadata, 'decimals' | 'ticker' | 'logo'>

type AmountProps = {
  coin: DepositCoin
  amount: number
  highPrecision?: boolean
}

const Amount = ({ coin, amount, highPrecision }: AmountProps) => (
  <VStack alignItems="center" gap={4}>
    <Text
      as="span"
      size={22}
      weight={500}
      height={24 / 22}
      letterSpacing={-0.36}
      color="regular"
      centerHorizontally
      data-testid="transaction-overview-amount"
    >
      {formatAmount(amount, highPrecision ? { precision: 'high' } : undefined)}{' '}
      {coin.ticker}
    </Text>
    <TransactionOverviewFiatAmount coin={coin} amount={amount} />
  </VStack>
)

type DepositReviewCardProps = {
  /** Names the action, e.g. "You're bonding". */
  label: ReactNode
  coin: DepositCoin
  fallbackAmount: number
  keysignPayloadQuery: Query<KeysignPayload>
  getPayloadAmount?: (payload: KeysignPayload) => bigint | number | string
}

/**
 * The deposit's amount as a card: what the action is, the coin, and the amount
 * as it will be signed (the form's figure until the payload resolves).
 */
export const DepositReviewCard = ({
  label,
  coin,
  fallbackAmount,
  keysignPayloadQuery,
  getPayloadAmount = payload => payload.toAmount,
}: DepositReviewCardProps) => (
  <ReviewCard>
    <Text as="span" variant="stationBodyS" color="shy" centerHorizontally>
      {label}
    </Text>
    <CoinIcon coin={coin} style={{ fontSize: 36 }} />
    <MatchQuery
      value={keysignPayloadQuery}
      pending={() => <Spinner />}
      error={() => <Amount coin={coin} amount={fallbackAmount} />}
      success={payload => (
        <Amount
          coin={coin}
          amount={fromChainAmount(getPayloadAmount(payload), coin.decimals)}
          highPrecision
        />
      )}
    />
  </ReviewCard>
)
