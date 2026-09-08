import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { TokenVerificationBadge } from '@core/ui/chain/coin/verification/TokenVerificationBadge'
import { CoinTicker } from '@core/ui/vault/chain/CoinTicker'
import {
  useCurrentVaultAddress,
  useCurrentVaultCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { panel } from '@lib/ui/panel/Panel'
import { IsActiveProp, OnClickProp, ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { areEqualCoins, Coin } from '@vultisig/core-chain/coin/Coin'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import styled from 'styled-components'

import { CoinOptionFiatAmount } from './CoinOptionFiatAmount'
import { CoinOptionFiatValue } from './CoinOptionFiatValue'

export const CoinOption = ({
  value,
  onClick,
}: ValueProp<Coin> & OnClickProp & IsActiveProp) => {
  const { chain, ticker } = value
  const coins = useCurrentVaultCoins()
  const vaultCoin = coins.find(c => areEqualCoins(c, value))

  return (
    <Container
      fullWidth
      tabIndex={0}
      role="button"
      onClick={onClick}
      justifyContent="space-between"
      alignItems="center"
      data-testid={`coin-option-${ticker}`}
    >
      <CoinDetails alignItems="center" gap={12}>
        <CoinIcon coin={value} style={{ fontSize: 32 }} />
        <CoinLabel gap={8} alignItems="center">
          <CoinTicker ticker={ticker} size={13} weight="500" />
          <TokenVerificationBadge value={value} />
          <PillWrapper>
            <Text color="shy" size={11} weight="500" nowrap>
              {chain}
            </Text>
          </PillWrapper>
        </CoinLabel>
      </CoinDetails>
      <BalanceColumn gap={4} justifyContent="center" alignItems="flex-end">
        {vaultCoin ? (
          <VaultCoinBalance value={vaultCoin} />
        ) : (
          <CoinOptionFiatValue value={0} />
        )}
      </BalanceColumn>
    </Container>
  )
}

const VaultCoinBalance = ({ value }: ValueProp<Coin>) => {
  const { chain, ticker, decimals } = value
  const address = useCurrentVaultAddress(chain)
  const coin = { ...value, address }
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))

  return (
    <MatchQuery
      value={balanceQuery}
      pending={() => (
        <VStack gap={6} fullHeight fullWidth>
          <VStack flexGrow>
            <Skeleton />
          </VStack>
          <VStack flexGrow>
            <Skeleton />
          </VStack>
        </VStack>
      )}
      success={balance => (
        <VStack gap={6}>
          <VStack flexGrow alignItems="flex-end">
            <Text
              style={{
                textAlign: 'right',
              }}
              as="span"
              size={12}
              color="contrast"
              weight={500}
              cropped
            >
              {formatAmount(fromChainAmount(balance, decimals), { ticker })}
            </Text>
          </VStack>
          <VStack flexGrow alignItems="flex-end">
            {balance > 0 ? (
              <CoinOptionFiatAmount
                coin={coin}
                amount={fromChainAmount(balance, decimals)}
              />
            ) : (
              <CoinOptionFiatValue value={0} />
            )}
          </VStack>
        </VStack>
      )}
    />
  )
}

const Container = styled(HStack)`
  ${panel()};
  padding: 12px 20px;
  border-radius: 0;
  position: relative;
  background-color: ${getColor('foreground')};
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    width: min(320px, 100%);
    height: 1px;
    background: linear-gradient(90deg, #061b3a 0%, #284570 49.5%, #061b3a 100%);
    transform: translateX(-50%);
    pointer-events: none;
  }

  &:last-child::after {
    content: none;
  }
`

/**
 * Icon, ticker and chain pill. It has to shrink, or a ticker that is a raw
 * contract address makes the row wider than the modal — and because the list
 * around it scrolls vertically, that overflow becomes a horizontal scrollbar
 * rather than being clipped.
 */
const CoinDetails = styled(HStack)`
  min-width: 0;

  > svg,
  > img {
    flex-shrink: 0;
  }
`

const CoinLabel = styled(HStack)`
  min-width: 0;
`

const PillWrapper = styled.div`
  flex-shrink: 0;
  display: grid;
  place-items: center;
  padding: 8px 12px;
  ${borderRadius.pill};
  border: 1px solid ${getColor('foregroundExtra')};

  @media (max-width: 400px) {
    padding: 4px 8px;
  }
`

/**
 * Balance for the row. At the popup width it gives way to the ticker, which is
 * what tells two rows apart: capped, a four-letter ticker stays whole; without
 * a cap the ticker was down to two legible characters.
 */
const BalanceColumn = styled(VStack)`
  min-width: 100px;
  height: 50px;

  @media (max-width: 400px) {
    min-width: 0;
    max-width: 90px;
  }
`
