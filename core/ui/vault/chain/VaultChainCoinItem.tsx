import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { TokenVerificationBadge } from '@core/ui/chain/coin/verification/TokenVerificationBadge'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { CoinAmount, CoinKey } from '@vultisig/core-chain/coin/Coin'
import { EntityWithLogo } from '@vultisig/lib-utils/entities/EntityWithLogo'
import { EntityWithPrice } from '@vultisig/lib-utils/entities/EntityWithPrice'
import { EntityWithTicker } from '@vultisig/lib-utils/entities/EntityWithTicker'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FiatAmountText } from '../../chain/components/FiatAmountText'
import { useFormatFiatAmount } from '../../chain/hooks/useFormatFiatAmount'
import { CoinTicker } from './CoinTicker'

const PriceBadge = styled.div`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: 3px 8px;
  ${borderRadius.sm};
  background: ${getColor('foregroundExtra')};
`

/**
 * Everything to the right of the coin icon. `width: 100%` alone makes it a
 * flex item that will not shrink below the full row, which pushed the balance
 * column out past the panel; the row only has the width the icon leaves it.
 */
const RowBody = styled(VStack)`
  min-width: 0;
`

/**
 * Native balance under the fiat value. Its cap is what keeps the balance
 * column bounded, so the ticker beside it still gets a share of the row: the
 * popup leaves the row 296px, of which 96 goes to the icon, gaps and chevron.
 */
const NativeAmount = styled(Text)`
  max-width: 160px;

  @media (max-width: 400px) {
    max-width: 100px;
  }
`

type VaultChainCoinItemProps = ValueProp<
  Partial<EntityWithLogo> &
    EntityWithTicker &
    CoinAmount &
    Partial<EntityWithPrice> &
    CoinKey
> & {
  /**
   * Set only for a token that cannot hold a balance yet — an XRPL issued
   * currency with no trust line. The row then offers the one action that fixes
   * that instead of a balance that is stuck at zero and explains nothing.
   */
  onActivate?: () => void
}

/**
 * A single coin row in the vault's asset list: icon, ticker, price badge, and
 * either the fiat/native balance or — when `onActivate` is set — an Activate
 * button in its place.
 */
export const VaultChainCoinItem = ({
  value,
  onActivate,
}: VaultChainCoinItemProps) => {
  const { t } = useTranslation()
  const { ticker, amount, decimals, price } = value
  const balance = fromChainAmount(amount, decimals)
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <HStack fullWidth alignItems="center" gap={12}>
      <CoinIcon coin={value} style={{ fontSize: 32 }} />

      <RowBody fullWidth alignItems="start" gap={12}>
        <HStack
          fullWidth
          alignItems="center"
          justifyContent="space-between"
          gap={20}
        >
          <VStack gap={4} flexGrow style={{ minWidth: 0 }}>
            <HStack alignItems="center" gap={6}>
              <CoinTicker ticker={ticker} />
              <TokenVerificationBadge value={value} />
            </HStack>
            <PriceBadge>
              <Text weight={500} color="shyExtra" size={12}>
                <FiatAmountText value={price ?? 0} />
              </Text>
            </PriceBadge>
          </VStack>
          <HStack gap={8} alignItems="center" style={{ flexShrink: 0 }}>
            {onActivate ? (
              // Replaces the balance only: a zero that cannot move until the
              // trust line exists explains nothing, so the row offers the action
              // that fixes it instead.
              <Button
                kind="primary"
                size="sm"
                onClick={event => {
                  event.stopPropagation()
                  onActivate()
                }}
              >
                {t('activate')}
              </Button>
            ) : (
              <VStack
                gap={8}
                justifyContent="space-between"
                alignItems="flex-end"
              >
                <Text centerVertically color="contrast" weight="550" size={14}>
                  <BalanceVisibilityAware>
                    {formatFiatAmount((price || 0) * balance)}
                  </BalanceVisibilityAware>
                </Text>
                <NativeAmount weight={500} color="shy" size={12} cropped>
                  <BalanceVisibilityAware>
                    {formatAmount(balance, { precision: 'high' })} {ticker}
                  </BalanceVisibilityAware>
                </NativeAmount>
              </VStack>
            )}
            <IconWrapper>
              <ChevronRightIcon />
            </IconWrapper>
          </HStack>
        </HStack>
      </RowBody>
    </HStack>
  )
}
