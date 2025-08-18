import { Coin, CoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { swapEnabledChains } from '@core/chain/swap/swapEnabledChains'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { CoinOption } from '@core/ui/chain/coin/inputs/CoinOption'
import {
  useCurrentVaultCoin,
  useCurrentVaultCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { SelectItemModal } from '@lib/ui/inputs/SelectItemModal'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { InputProps, IsActiveProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { pick } from '@lib/utils/record/pick'
import { FC, useMemo } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAutoDiscoverTokensQuery } from '../../../chain/hooks/useAutoDiscoverTokensQuery'
import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useTransferDirection } from '../../../state/transferDirection'
import { ChainOption } from '../components/ChainOption'
import { SwapCoinInputField } from '../components/SwapCoinInputField'
import { useToCoin } from '../state/toCoin'
import { useChainSummaries } from './hooks/useChainSummaries'
import { useScrollSelectedChainIntoView } from './hooks/useScrollSelectedChainIntoView'
import { useSortedSwapCoins } from './hooks/useSortedSwapCoins'

export const SwapCoinInput: FC<InputProps<CoinKey>> = ({ value, onChange }) => {
  const [opened, setOpened] = useState<null | 'coin' | 'chain'>(null)

  const { t } = useTranslation()
  const coins = useCurrentVaultCoins()
  const coin = shouldBePresent(useCurrentVaultCoin(value))
  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const [currentToCoin] = useToCoin()
  const side = useTransferDirection()
  const chainSummaries = useChainSummaries()

  const coinOptions = useMemo(
    () =>
      coins.filter(c => isOneOf(c.chain, swapEnabledChains) && isFeeCoin(c)),
    [coins]
  )

  const sortedSwapCoins = useSortedSwapCoins(value)
  const currentChain = side === 'from' ? fromCoinKey.chain : currentToCoin.chain

  const { discoveredCoins, ensureSaved } = useAutoDiscoverTokensQuery({
    chain: currentChain,
    enabled: opened === 'coin',
  })

  const { footerRef, itemRefs, scrollChainIntoView } =
    useScrollSelectedChainIntoView({
      chain: currentChain,
      enabled: opened === 'coin',
    })

  const mergedOptions: Coin[] = [...sortedSwapCoins, ...discoveredCoins]

  return (
    <>
      <SwapCoinInputField
        value={{ ...value, ...pick(coin, ['logo', 'ticker']) }}
        onChainClick={() => setOpened('chain')}
        onCoinClick={() => setOpened('coin')}
      />
      {opened === 'coin' && (
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
              setOpened(null)
            }
          }}
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
      )}

      {opened === 'chain' && (
        <SelectItemModal
          renderListHeader={() => (
            <HStack alignItems="center" justifyContent="space-between">
              <Text color="shy" size={12} weight={500}>
                {t('chain')}
              </Text>
              <Text color="shy" size={12} weight={500}>
                {t('balance')}
              </Text>
            </HStack>
          )}
          title={t('select_network')}
          optionComponent={props => {
            const currentItemChain = props.value.chain
            const isSelected =
              side === 'from'
                ? currentItemChain === fromCoinKey.chain
                : currentItemChain === currentToCoin.chain

            const summary = chainSummaries.data?.[currentItemChain]

            return (
              <ChainOption
                {...props}
                isSelected={isSelected}
                totalFiatAmount={summary?.totalUsd}
              />
            )
          }}
          onFinish={(newValue: CoinKey | undefined) => {
            const currentCoinChain =
              side === 'from' ? fromCoinKey.chain : currentToCoin.chain

            if (newValue && newValue.chain !== currentCoinChain) {
              onChange(newValue)
            }
            setOpened(null)
          }}
          options={coinOptions}
          filterFunction={(option, query) => {
            const q = query.trim().toLowerCase()
            if (!q) return true
            const chain = option.chain?.toLowerCase() ?? ''
            const ticker = option.ticker?.toLowerCase() ?? ''
            return chain.startsWith(q) || ticker.startsWith(q)
          }}
        />
      )}
    </>
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
