import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VerifyKeysignStart } from '@core/ui/mpc/keysign/start/VerifyKeysignStart'
import { KeysignFeeAmount } from '@core/ui/mpc/keysign/tx/FeeAmount'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { LimitSwapExpiryHours } from '@vultisig/core-chain/swap/native/limitSwapMemo'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useLimitSwapKeysignPayloadQuery } from './queries/useLimitSwapKeysignPayloadQuery'
import { useLimitExpiryLabels } from './useLimitExpiryLabels'

const formatNumber = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 8 })

export type LimitOrderReviewData = {
  fromCoin: AccountCoin
  toCoin: AccountCoin
  /** Sell amount in the sell coin's natural units, for display. */
  sellAmount: number
  /** Source amount in the sell coin's smallest units, for signing. */
  sellChainAmount: bigint
  /** Guaranteed-minimum output in the buy coin's natural units, for display. */
  receiveAmount: number
  /** The memo's LIM in THORChain's 1e8 fixed point, for the co-signer display. */
  expectedToAmount: bigint
  /** The `=<` memo to sign. */
  memo: string
  /** Target price of one buy unit, in sell-asset units. */
  unitPrice: string | undefined
  /** Target price of one buy unit, in fiat. */
  targetPriceLabel: string | undefined
  expiryHours: LimitSwapExpiryHours
}

type LimitOrderReviewProps = LimitOrderReviewData & OnBackProp

/**
 * Verify + sign a placed limit order.
 *
 * Reuses the market swap's keysign pipeline (`VerifyKeysignStart`) — the terms
 * checkbox, the Blockaid scan row, and the Paired / Fast Sign ceremony — feeding
 * it a limit-order payload instead of a market one. No `swapQuote` is passed: a
 * limit order has none, and the deposit signs like any other keysign.
 */
export const LimitOrderReview: FC<LimitOrderReviewProps> = ({
  fromCoin,
  toCoin,
  sellAmount,
  sellChainAmount,
  receiveAmount,
  expectedToAmount,
  memo,
  unitPrice,
  targetPriceLabel,
  expiryHours,
  onBack,
}) => {
  const { t } = useTranslation()
  const expiryLabel = useLimitExpiryLabels()

  const keysignPayloadQuery = useLimitSwapKeysignPayloadQuery({
    fromCoin,
    toCoin,
    amount: sellChainAmount,
    memo,
    expectedToAmount,
  })

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('swap_overview')}
        hasBorder
      />
      <VerifyKeysignStart
        keysignPayloadQuery={keysignPayloadQuery}
        terms={[t('swap_limit_confirm')]}
      >
        <Card gap={16}>
          <Text size={16} weight={500} color="contrast">
            {t('swap_limit_review_heading')}
          </Text>
          <Leg
            coin={fromCoin}
            amount={sellAmount}
            label={t('swap_limit_sell')}
          />
          <IconWrapper>
            <ArrowDownIcon />
          </IconWrapper>
          <Leg
            coin={toCoin}
            amount={receiveAmount}
            label={t('swap_limit_buy')}
          />
          <Divider />
          <Row
            label={t('swap_limit_review_target_price')}
            value={targetPriceLabel ?? unitPrice ?? '—'}
          />
          <Row
            label={t('swap_limit_expiry_label')}
            value={expiryLabel[expiryHours]}
          />
          <Row
            label={t('network_fee')}
            value={
              <MatchQuery
                value={keysignPayloadQuery}
                pending={() => t('loading')}
                error={() => t('failed_to_load')}
                success={keysignPayload => (
                  <KeysignFeeAmount keysignPayload={keysignPayload} />
                )}
              />
            }
          />
        </Card>
      </VerifyKeysignStart>
    </>
  )
}

type LegProps = {
  coin: AccountCoin
  amount: number
  label: string
}

const Leg: FC<LegProps> = ({ coin, amount, label }) => (
  <HStack alignItems="center" gap={12}>
    <CoinIcon coin={coin} style={{ fontSize: 32 }} />
    <VStack gap={2}>
      <Text size={12} color="shy">
        {label}
      </Text>
      <Text size={18} weight={500} color="contrast">
        {`${formatNumber(amount)} ${coin.ticker}`}
      </Text>
    </VStack>
  </HStack>
)

type RowProps = {
  label: string
  value: React.ReactNode
}

const Row: FC<RowProps> = ({ label, value }) => (
  <HStack justifyContent="space-between" alignItems="center">
    <Text size={13} color="shy">
      {label}
    </Text>
    <Text size={13} weight={500} color="contrast">
      {value}
    </Text>
  </HStack>
)

const Card = styled(VStack)`
  border: 1px solid ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
  border-radius: 12px;
  padding: 16px;
`

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.foregroundExtra.toCssValue()};
`

const IconWrapper = styled.div`
  color: ${({ theme }) => theme.colors.textShy.toCssValue()};
  font-size: 16px;
`
