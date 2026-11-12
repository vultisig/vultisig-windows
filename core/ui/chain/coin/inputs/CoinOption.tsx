import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { SecuredAssetSourceChainLabel } from '@core/ui/chain/coin/thorchain/SecuredAssetSourceChainLabel'
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
import styled, { css } from 'styled-components'

import { CoinOptionFiatAmount } from './CoinOptionFiatAmount'
import { CoinOptionFiatValue } from './CoinOptionFiatValue'

type CoinOptionProps = ValueProp<Coin> &
  OnClickProp &
  IsActiveProp & {
    /** Names the coin's chain in a pill beside its ticker. */
    showChain?: boolean
  }

const coinIconSizePx = 32
const coinDetailsGapPx = 12
const chainLabelGapPx = 8
const nameToBalanceGapPx = 8
/** Tickers up to about eight characters stay whole beside the chain pill. */
const chainRowTickerMaxWidthPx = 80
/** Tickers this short are never cropped. */
const tickerMinChars = 6
/** About six characters of a longer ticker stay visible. */
const tickerMinWidthPx = 60
/** About three characters, an ellipsis and the pill's padding. */
const chainPillMinWidthPx = 58
/** The pill gives up its width long before the ticker does. */
const chainPillShrinkWeight = 1000
/** Icon, cropped ticker and cropped pill: the balance crops before the name goes below this. */
const chainRowNameMinWidthPx =
  coinIconSizePx +
  coinDetailsGapPx +
  tickerMinWidthPx +
  chainLabelGapPx +
  chainPillMinWidthPx

/**
 * A coin to choose, with the vault's balance of it. `isActive` marks the coin
 * already chosen. With `showChain`, a short row crops the chain pill to a few
 * characters before it crops a long ticker, and never drops either.
 */
export const CoinOption = ({
  value,
  onClick,
  showChain,
  isActive,
}: CoinOptionProps) => {
  const { ticker } = value
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
      gap={showChain ? nameToBalanceGapPx : undefined}
      aria-current={isActive ? 'true' : undefined}
      $isActive={isActive === true}
      data-testid={`coin-option-${ticker}`}
    >
      <CoinDetails
        alignItems="center"
        gap={coinDetailsGapPx}
        $isChainRow={showChain === true}
      >
        <CoinIcon coin={value} style={{ fontSize: coinIconSizePx }} />
        <CoinName gap={2}>
          {showChain ? (
            <ChainCoinLabel gap={chainLabelGapPx} alignItems="center">
              <TickerSlot $isShrinkable={ticker.length > tickerMinChars}>
                <CoinTicker
                  ticker={ticker}
                  size={13}
                  weight="500"
                  maxWidth={chainRowTickerMaxWidthPx}
                />
              </TickerSlot>
              <TokenVerificationBadge value={value} />
              <ChainPill
                color="shyExtra"
                nowrap
                cropped
                variant="caption"
                title={value.chain}
              >
                {value.chain}
              </ChainPill>
            </ChainCoinLabel>
          ) : (
            <CoinLabel gap={8} alignItems="center">
              <CoinTicker ticker={ticker} size={13} weight="500" />
              <TokenVerificationBadge value={value} />
            </CoinLabel>
          )}
          <SecuredAssetSourceChainLabel value={value} size={12} />
        </CoinName>
      </CoinDetails>
      <BalanceColumn
        alignItems="flex-end"
        gap={4}
        justifyContent="center"
        style={showChain ? { height: 'auto' } : undefined}
        $isChainRow={showChain === true}
      >
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

const Container = styled(HStack)<{ $isActive: boolean }>`
  ${panel()};
  padding: 12px 20px;
  border-radius: 0;
  position: relative;
  background-color: ${({ $isActive }) =>
    getColor($isActive ? 'foregroundExtra' : 'foreground')};
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
 * Icon and ticker. It has to shrink, or a ticker that is a raw
 * contract address makes the row wider than the modal — and because the list
 * around it scrolls vertically, that overflow becomes a horizontal scrollbar
 * rather than being clipped. Beside a chain pill it keeps room for the
 * cropped ticker and pill, so the chain always stays readable.
 */
const CoinDetails = styled(HStack)<{ $isChainRow: boolean }>`
  min-width: ${({ $isChainRow }) =>
    $isChainRow ? `${chainRowNameMinWidthPx}px` : 0};

  > svg,
  > img {
    flex-shrink: 0;
  }
`

const CoinName = styled(VStack)`
  min-width: 0;
`

const CoinLabel = styled(HStack)`
  min-width: 0;
`

const ChainPill = styled(Text)`
  ${borderRadius.pill};
  background: ${getColor('foreground')};
  border: 1.5px solid ${getColor('foregroundExtra')};
  padding: 5.5px 10.5px;
`

const ChainCoinLabel = styled(HStack)`
  min-width: 0;

  > ${ChainPill} {
    flex: 0 ${chainPillShrinkWeight} auto;
    min-width: ${chainPillMinWidthPx}px;
  }
`

const TickerSlot = styled.div<{ $isShrinkable: boolean }>`
  display: flex;
  flex-shrink: ${({ $isShrinkable }) => ($isShrinkable ? 1 : 0)};
  min-width: ${({ $isShrinkable }) =>
    $isShrinkable ? `${tickerMinWidthPx}px` : 'auto'};
`

/**
 * Balance for the row. At the popup width it still yields to the ticker, which
 * is what tells two rows apart, but with the chain pill gone there is more to
 * share and the cap can be looser.
 */
const BalanceColumn = styled(VStack)<{ $isChainRow: boolean }>`
  min-width: 100px;
  height: 50px;

  /* Beside a chain pill a long balance crops inside the column instead of spilling over the name. */
  ${({ $isChainRow }) =>
    $isChainRow &&
    css`
      * {
        max-width: 100%;
      }
    `}

  @media (max-width: 400px) {
    min-width: 0;
    max-width: 120px;
  }
`
