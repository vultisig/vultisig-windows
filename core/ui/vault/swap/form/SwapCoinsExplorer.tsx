import { CoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { swapEnabledChains } from '@core/chain/swap/swapEnabledChains'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { SelectItemModal } from '@lib/ui/inputs/SelectItemModal'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { InputProps, IsActiveProp, OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CoinIcon } from '../../../chain/coin/icon/CoinIcon'
import { CoinOption } from '../../../chain/coin/inputs/CoinOption'
import { useAutoDiscoverTokens } from '../../../chain/hooks/useAutoDiscoverTokens'
import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useTransferDirection } from '../../../state/transferDirection'
import { useSortedByBalanceCoins } from '../../chain/coin/hooks/useSortedByBalanceCoins'
import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { SwapHorizontalDivider } from '../components/SwapHorizontalDivider'
import { useToCoin } from '../state/toCoin'
import { useCenteredSnapCarousel } from './hooks/useScrollSelectedChainIntoView'

export const SwapCoinsExplorer = ({
  onChange,
  value,
  onClose,
}: OnCloseProp & InputProps<CoinKey>) => {
  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const [currentToCoin] = useToCoin()
  const side = useTransferDirection()
  const coins = useCurrentVaultCoins()
  const { t } = useTranslation()

  const coinOptions = useMemo(
    () =>
      coins.filter(c => isOneOf(c.chain, swapEnabledChains) && isFeeCoin(c)),
    [coins]
  )

  const currentChain = side === 'from' ? fromCoinKey.chain : currentToCoin.chain

  const sortedSwapCoins = useSortedByBalanceCoins(value)
  const { discoveredCoins, ensureSaved } = useAutoDiscoverTokens({
    chain: currentChain,
  })
  const mergedOptions = useMemo(
    () => [...sortedSwapCoins, ...discoveredCoins],
    [discoveredCoins, sortedSwapCoins]
  )

  const { footerRef, itemRefs, scrollToKey, strokeRef } =
    useCenteredSnapCarousel({
      chain: currentChain,
      onSelect: chain => {
        const coin = coinOptions.find(o => o.chain === chain)
        if (coin) onChange(coin)
      },
    })

  return (
    <SelectItemModal
      virtualizePageSize={20}
      filterFunction={(option, query) =>
        option.ticker.toLowerCase().startsWith(query.toLowerCase())
      }
      title={t('select_asset')}
      optionComponent={CoinOption}
      onFinish={async (newValue: CoinKey | undefined) => {
        try {
          if (newValue) {
            await ensureSaved(newValue)
            onChange(newValue)
          }
        } finally {
          onClose()
        }
      }}
      getKey={(v, i) => `${v}-${i}`}
      options={mergedOptions}
      renderFooter={() => (
        <VStack gap={11}>
          <SwapHorizontalDivider />
          <VStack gap={7}>
            <FooterText height="large" centerHorizontally color="shy" size={12}>
              {t('select_network')}
            </FooterText>

            <CarouselViewport>
              <CarouselWrapper ref={footerRef}>
                {coinOptions.map(c => {
                  const chain = c.chain
                  const isActive =
                    side === 'from'
                      ? chain === fromCoinKey.chain
                      : chain === currentToCoin.chain

                  return (
                    <FooterItem
                      ref={el => {
                        itemRefs.current[chain] = el
                      }}
                      tabIndex={0}
                      role="button"
                      onClick={() => {
                        scrollToKey(chain, 'smooth')
                        if (!isActive) onChange(c)
                      }}
                      isActive={isActive}
                      key={chain}
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

  /* Snap config */
  scroll-snap-type: x mandatory;
  scroll-snap-stop: always;
  scroll-padding: 0 50%;
  scroll-behavior: smooth;

  /* Ensure first/last items can reach the center */
  &::before,
  &::after {
    content: '';
    flex: 0 0 50%;
  }
`

const FooterItem = styled.div<IsActiveProp>`
  ${hStack({ gap: 6, alignItems: 'center' })};
  flex-shrink: 0;
  cursor: pointer;
  padding: 8px 12px 8px 8px;
  border-radius: 99px;
  transition: background 0.3s;

  scroll-snap-align: center;

  &:hover {
    ${({ isActive, theme }) =>
      !isActive &&
      `
        background: ${getColor('foregroundExtra')({ theme })};
      `}
  }
`

const CenterStroke = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  translate: -50%;
  width: 100px;
  pointer-events: none;
  border: 1px solid ${({ theme }) => theme.colors.buttonPrimary.toCssValue()};
  border-radius: 99px;
  background: rgba(6, 27, 58, 0.01);
  box-shadow: 0 0 13.7px 0 rgba(33, 85, 223, 0.68);
  transform: translateX(-0.5px);
`

const FooterText = styled(Text)`
  line-height: 21.59px;
`
