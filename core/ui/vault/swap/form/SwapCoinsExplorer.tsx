import {
  areEqualCoins,
  Coin,
  CoinKey,
  coinKeyToString,
} from '@core/chain/coin/Coin'
import { knownTokens } from '@core/chain/coin/knownTokens'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { swapEnabledChains } from '@core/chain/swap/swapEnabledChains'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { SelectItemModal } from '@lib/ui/inputs/SelectItemModal'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { InputProps, IsActiveProp, OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CoinIcon } from '../../../chain/coin/icon/CoinIcon'
import { CoinOption } from '../../../chain/coin/inputs/CoinOption'
import { useWhitelistedCoinsQuery } from '../../../chain/coin/queries/useWhitelistedCoinsQuery'
import { useTransferDirection } from '../../../state/transferDirection'
import { useCreateCoinMutation } from '../../../storage/coins'
import { useSortedByBalanceCoins } from '../../chain/coin/hooks/useSortedByBalanceCoins'
import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { SwapHorizontalDivider } from '../components/SwapHorizontalDivider'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'
import { useCenteredSnapCarousel } from './hooks/useScrollSelectedChainIntoView'

export const SwapCoinsExplorer = ({
  onChange,
  value,
  onClose,
}: OnCloseProp & InputProps<CoinKey>) => {
  const [fromCoinKey] = useSwapFromCoin()
  const [currentToCoin] = useSwapToCoin()
  const side = useTransferDirection()
  const coins = useCurrentVaultCoins()
  const { mutate: createCoin } = useCreateCoinMutation()
  const currentChain = side === 'from' ? fromCoinKey.chain : currentToCoin.chain

  const { data: whitelisted } = useWhitelistedCoinsQuery(currentChain)

  const sortedSwapCoins = useSortedByBalanceCoins(value)
  const options = useMemo(() => {
    const result: Coin[] = [...sortedSwapCoins]

    const extraCoins = [
      ...(knownTokens[currentChain] ?? []),
      ...(whitelisted ?? []),
    ]

    extraCoins.forEach(coin => {
      if (result.some(existing => areEqualCoins(existing, coin))) return
      result.push(coin)
    })

    return result
  }, [currentChain, sortedSwapCoins, whitelisted])

  const { t } = useTranslation()

  const coinOptions = useMemo(
    () =>
      coins.filter(c => isOneOf(c.chain, swapEnabledChains) && isFeeCoin(c)),
    [coins]
  )

  const { footerRef, scrollToKey, strokeRef, onKeyDown, setItemRef } =
    useCenteredSnapCarousel({
      chain: currentChain,
      onSelect: chain => {
        const coin = coinOptions.find(o => o.chain === chain)
        if (coin) onChange(coin)
      },
    })

  const filterByTicker = useCallback(
    (option: Coin, query: string) =>
      option.ticker.toLowerCase().startsWith(query.toLowerCase()),
    []
  )

  return (
    <SelectItemModal
      virtualizePageSize={20}
      filterFunction={filterByTicker}
      title={t('select_asset')}
      optionComponent={CoinOption}
      onFinish={async newValue => {
        if (newValue) {
          if (coins.some(c => areEqualCoins(c, newValue))) {
            onChange(newValue)
          } else {
            createCoin(newValue, {
              onSuccess: () => onChange(newValue),
            })
          }
        }
        onClose()
      }}
      getKey={v => coinKeyToString(v)}
      options={options}
      renderFooter={() => (
        <VStack gap={11}>
          <SwapHorizontalDivider />
          <VStack gap={7}>
            <FooterText height="large" centerHorizontally color="shy" size={12}>
              {t('select_chain')}
            </FooterText>

            <CarouselViewport>
              <CarouselWrapper
                ref={footerRef}
                role="tablist"
                aria-label={t('select_chain')}
                onKeyDown={onKeyDown}
                tabIndex={0}
              >
                {coinOptions.map(c => {
                  const chain = c.chain
                  const isActive =
                    side === 'from'
                      ? chain === fromCoinKey.chain
                      : chain === currentToCoin.chain

                  return (
                    <FooterItem
                      ref={el => setItemRef(chain, el)}
                      tabIndex={0}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        scrollToKey(chain)
                        if (!isActive) onChange(c)
                      }}
                      isActive={isActive}
                      key={chain}
                      data-key={chain}
                    >
                      <CoinIcon coin={c} style={{ fontSize: 16 }} />
                      <Text size={12} weight={500}>
                        {chain}
                      </Text>
                    </FooterItem>
                  )
                })}
              </CarouselWrapper>

              <CenterStroke ref={strokeRef} aria-hidden />
            </CarouselViewport>
          </VStack>
        </VStack>
      )}
    />
  )
}

const CarouselViewport = styled.div`
  position: relative;
`

const CarouselWrapper = styled.div`
  ${hStack({ alignItems: 'center', gap: 10 })};
  overflow-x: auto;
  ${hideScrollbars};
  -webkit-overflow-scrolling: touch;

  scroll-snap-type: x mandatory;
  scroll-padding: 0 50%;

  padding-inline: 50%;
`

const FooterItem = styled.div<IsActiveProp>`
  ${hStack({ gap: 6, alignItems: 'center' })};
  flex-shrink: 0;
  scroll-snap-stop: always;
  cursor: pointer;
  padding: 8px 12px 8px 8px;
  border-radius: 99px;
  transition: background 0.2s ease;
  outline: none;

  scroll-snap-align: center;
  scroll-snap-stop: always;

  &:hover {
    ${({ isActive, theme }) =>
      !isActive &&
      `
        background: ${getColor('foregroundExtra')({ theme })};
      `}
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px
      ${({ theme }) => theme.colors.buttonPrimary.toCssValue()};
  }
`

const CenterStroke = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  translate: -50%;
  pointer-events: none;
  border: 1px solid ${({ theme }) => theme.colors.buttonPrimary.toCssValue()};
  border-radius: 99px;
  background: rgba(6, 27, 58, 0.02);
  box-shadow: 0 0 14px 0 rgba(33, 85, 223, 0.45);
  transition:
    width 200ms ease,
    box-shadow 200ms ease;
  will-change: width;
  width: 44px;
`

const FooterText = styled(Text)`
  line-height: 21.59px;
`
