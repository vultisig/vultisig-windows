import { CoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { swapEnabledChains } from '@core/chain/swap/swapEnabledChains'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { SelectItemModal } from '@lib/ui/inputs/SelectItemModal'
import { hStack } from '@lib/ui/layout/Stack'
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
import { useToCoin } from '../state/toCoin'
import { useScrollSelectedChainIntoView } from './hooks/useScrollSelectedChainIntoView'

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
  const { footerRef, itemRefs, scrollChainIntoView } =
    useScrollSelectedChainIntoView({
      chain: currentChain,
    })

  const sortedSwapCoins = useSortedByBalanceCoins(value)
  const { discoveredCoins, ensureSaved } = useAutoDiscoverTokens({
    chain: currentChain,
  })

  const mergedOptions = useMemo(
    () => [...sortedSwapCoins, ...discoveredCoins],
    [discoveredCoins, sortedSwapCoins]
  )

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
      getKey={(value, index) => `${value}-${index}`}
      options={mergedOptions}
      renderFooter={() => (
        <Footer
          onWheel={e => {
            if (e.deltaY === 0) return
            e.currentTarget.scrollBy({ left: e.deltaY, behavior: 'smooth' })
          }}
          ref={footerRef}
        >
          {coinOptions.map(c => {
            const chain = c.chain
            return (
              <FooterItem
                ref={el => {
                  itemRefs.current[chain] = el
                }}
                tabIndex={0}
                role="button"
                onClick={() => {
                  scrollChainIntoView(chain, 'smooth')
                  if (currentChain !== chain) {
                    const coin = coinOptions.find(o => o.chain === chain)!
                    onChange(coin)
                  }
                }}
                isActive={
                  side === 'from'
                    ? chain === fromCoinKey.chain
                    : chain === currentToCoin.chain
                }
                key={chain}
              >
                <CoinIcon coin={c} style={{ fontSize: 16 }} />
                <Text size={12} weight={500}>
                  {chain}
                </Text>
              </FooterItem>
            )
          })}
        </Footer>
      )}
    />
  )
}

const Footer = styled.div`
  ${hStack({
    alignItems: 'center',
    gap: 10,
  })};
  overflow-x: auto;
  ${hideScrollbars};
`

const FooterItem = styled.div<IsActiveProp>`
  ${hStack({
    gap: 6,
    alignItems: 'center',
  })};

  flex-shrink: 0;
  cursor: pointer;
  padding: 8px 12px 8px 8px;
  border-radius: 99px;
  transition: background 0.3s;

  ${({ isActive, theme }) =>
    isActive &&
    `
      /* One off colors, not adding them to the theme */
      background: rgba(6, 27, 58, 0.01);
      box-shadow: 0 0 13.7px 0 rgba(33, 85, 223, 0.68);
      border: 1px solid ${theme.colors.buttonPrimary.toCssValue()};
  `}

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`
