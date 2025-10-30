import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { CoinAmount, CoinKey } from '@core/chain/coin/Coin'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { BalanceVisibilityAware } from '@core/ui/vault/balance/visibility/BalanceVisibilityAware'
import { ChevronRightIcon } from '@lib/ui/icons/ChevronRightIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { EntityWithLogo } from '@lib/utils/entities/EntityWithLogo'
import { EntityWithPrice } from '@lib/utils/entities/EntityWithPrice'
import { EntityWithTicker } from '@lib/utils/entities/EntityWithTicker'
import { formatAmount } from '@lib/utils/formatAmount'
import styled from 'styled-components'

import { useFormatFiatAmount } from '../../chain/hooks/useFormatFiatAmount'

const PriceBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 8px;
  background: ${getColor('foregroundExtra')};
`

export const VaultChainCoinItem = ({
  value,
}: ValueProp<
  Partial<EntityWithLogo> &
    EntityWithTicker &
    CoinAmount &
    Partial<EntityWithPrice> &
    CoinKey
>) => {
  const { ticker, amount, decimals, price } = value
  const balance = fromChainAmount(amount, decimals)
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <HStack fullWidth alignItems="center" gap={12}>
      <CoinIcon coin={value} style={{ fontSize: 32 }} />

      <VStack fullWidth alignItems="start" gap={12}>
        <HStack
          fullWidth
          alignItems="center"
          justifyContent="space-between"
          gap={20}
        >
          <VStack gap={4}>
            <Text color="contrast" size={14}>
              {ticker}
            </Text>
            <PriceBadge>
              <Text weight={500} color="shyExtra" size={12}>
                {price ? formatFiatAmount(price) : '$0.00'}
              </Text>
            </PriceBadge>
          </VStack>
          <HStack gap={8} alignItems="center">
            <VStack
              gap={8}
              justifyContent="space-between"
              alignItems="flex-end"
            >
              <Text centerVertically color="contrast" weight="550" size={14}>
                <BalanceVisibilityAware>
                  {formatFiatAmount(price || 0)}
                </BalanceVisibilityAware>
              </Text>
              <Text weight={500} color="shy" size={12} centerVertically>
                <BalanceVisibilityAware>
                  {formatAmount(balance, { precision: 'high' })} {ticker}
                </BalanceVisibilityAware>
              </Text>
            </VStack>
            <IconWrapper>
              <ChevronRightIcon />
            </IconWrapper>
          </HStack>
        </HStack>
      </VStack>
    </HStack>
  )
}
