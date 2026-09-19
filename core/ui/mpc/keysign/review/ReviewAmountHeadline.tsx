import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { TokenVerificationBadge } from '@core/ui/chain/coin/verification/TokenVerificationBadge'
import { TransactionOverviewFiatAmount } from '@core/ui/mpc/keysign/verify/components/TransactionOverviewFiatAmount'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { CoinKey, CoinMetadata } from '@vultisig/core-chain/coin/Coin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { ReactNode } from 'react'
import styled from 'styled-components'

type HeadlineCoin = CoinKey & Pick<CoinMetadata, 'decimals' | 'ticker' | 'logo'>

const Amount = styled(Text)`
  min-width: 0;
`

type ReviewAmountProps = {
  coin: HeadlineCoin
  amount: number
  highPrecision?: boolean
}

const ReviewAmount = ({ coin, amount, highPrecision }: ReviewAmountProps) => (
  <VStack alignItems="center" gap={4}>
    <HStack
      alignItems="center"
      justifyContent="center"
      gap={4}
      wrap="wrap"
      data-testid="transaction-overview-amount"
    >
      <CoinIcon coin={coin} style={{ fontSize: 24 }} />
      <Amount
        as="span"
        size={22}
        weight={500}
        height={24 / 22}
        letterSpacing={-0.36}
        color="regular"
      >
        {formatAmount(
          amount,
          highPrecision ? { precision: 'high' } : undefined
        )}{' '}
        {coin.ticker}
      </Amount>
      <TokenVerificationBadge value={coin} />
    </HStack>
    <TransactionOverviewFiatAmount coin={coin} amount={amount} />
  </VStack>
)

type ReviewAmountHeadlineProps = {
  coin: HeadlineCoin
  /** Shown until the payload resolves, and when it fails to. */
  fallbackAmount: number
  keysignPayloadQuery: Query<KeysignPayload>
  /** Reads the signed amount from the payload; defaults to `toAmount`. */
  getPayloadAmount?: (payload: KeysignPayload) => bigint | number | string
  /** The signed amount is not meaningful for this operation, so show none. */
  hidePayloadAmount?: (payload: KeysignPayload) => boolean
  /** Names the operation when it is not a plain transfer. */
  label?: ReactNode
}

/**
 * The amount a review sheet is about, centred at the top of the body: the
 * coin's icon and ticker, the amount as it will be signed, and its fiat
 * estimate. Prefers the payload's amount over the form's, so what is shown is
 * what is signed.
 */
export const ReviewAmountHeadline = ({
  coin,
  fallbackAmount,
  keysignPayloadQuery,
  getPayloadAmount = payload => payload.toAmount,
  hidePayloadAmount,
  label,
}: ReviewAmountHeadlineProps) => (
  <VStack alignItems="center" gap={8}>
    {label}
    <MatchQuery
      value={keysignPayloadQuery}
      pending={() => <Spinner />}
      error={() => <ReviewAmount coin={coin} amount={fallbackAmount} />}
      success={payload =>
        hidePayloadAmount?.(payload) ? null : (
          <ReviewAmount
            coin={coin}
            amount={fromChainAmount(getPayloadAmount(payload), coin.decimals)}
            highPrecision
          />
        )
      }
    />
  </VStack>
)
