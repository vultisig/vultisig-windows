import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { Button } from '@lib/ui/buttons/Button'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { LimitSwapExpiryHours } from '@vultisig/core-chain/swap/native/limitSwapMemo'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useLimitExpiryLabels } from './useLimitExpiryLabels'

const formatNumber = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 8 })

type LimitOrderReviewProps = {
  fromCoin: Coin
  toCoin: Coin
  /** Sell amount in the sell coin's natural units. */
  sellAmount: number
  /** Guaranteed-minimum output, derived from the memo's LIM. */
  receiveAmount: number
  /** Target price of one buy unit, in sell-asset units. */
  unitPrice: string | undefined
  /** Target price of one buy unit, in fiat. */
  targetPriceLabel: string | undefined
  expiryHours: LimitSwapExpiryHours
} & OnBackProp

/**
 * The composed order, ready to place.
 *
 * This is the hand-off from the compose form. Signing itself — fees, the
 * security scan, and the keysign ceremony — is the follow-up that consumes
 * `buildLimitSwapKeysignPayload`, so the confirm button stays disabled here.
 */
export const LimitOrderReview: FC<LimitOrderReviewProps> = ({
  fromCoin,
  toCoin,
  sellAmount,
  receiveAmount,
  unitPrice,
  targetPriceLabel,
  expiryHours,
  onBack,
}) => {
  const { t } = useTranslation()
  const expiryLabel = useLimitExpiryLabels()

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('swap_limit_review_title')}
        hasBorder
      />
      <PageContent gap={16} justifyContent="space-between" scrollable>
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
        </Card>

        <VStack gap={12}>
          {/* Signing consumes buildLimitSwapKeysignPayload (core-mpc 1.13.0); the
              fee + security-scan + keysign screen is the follow-up. */}
          <Text size={12} color="shy" centerHorizontally>
            {t('swap_limit_place_pending_signing')}
          </Text>
          <Button disabled data-testid="limit-confirm-order">
            {t('swap_limit_place_order')}
          </Button>
        </VStack>
      </PageContent>
    </>
  )
}

type LegProps = {
  coin: Coin
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
  value: string
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
