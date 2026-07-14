import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { SelectItemModal } from '@lib/ui/inputs/SelectItemModal'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { InputProps, IsActiveProp, OnCloseProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { NATIVE_MINT } from '@solana/spl-token'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  areEqualCoins,
  Coin,
  CoinKey,
  coinKeyToString,
} from '@vultisig/core-chain/coin/Coin'
import { knownTokens } from '@vultisig/core-chain/coin/knownTokens'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { CoinIcon } from '../../../chain/coin/icon/CoinIcon'
import { CoinOption } from '../../../chain/coin/inputs/CoinOption'
import { useWhitelistedCoinsQuery } from '../../../chain/coin/queries/useWhitelistedCoinsQuery'
import { useTransferDirection } from '../../../state/transferDirection'
import { useCreateCoinMutation } from '../../../storage/coins'
import { useSortedByBalanceCoins } from '../../chain/coin/hooks/useSortedByBalanceCoins'
import { usePortfolioVaultCoins } from '../../state/currentVaultCoins'
import { SwapHorizontalDivider } from '../components/SwapHorizontalDivider'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'
import { useSwapEnabledChainsForVault } from '../state/useSwapEnabledChainsForVault'
import { useCenteredSnapCarousel } from './hooks/useScrollSelectedChainIntoView'

export const SwapCoinsExplorer = ({
  onChange,
  onClose,
}: OnCloseProp & Pick<InputProps<CoinKey>, 'onChange'>) => {
  const [fromCoinKey] = useSwapFromCoin()
  const [currentToCoin] = useSwapToCoin()
  const side = useTransferDirection()
  const coins = usePortfolioVaultCoins()
  const swapEnabledChainsForVault = useSwapEnabledChainsForVault()
  const { mutateAsync: createCoin } = useCreateCoinMutation()
  const currentChain = side === 'from' ? fromCoinKey.chain : currentToCoin.chain

  const { data: whitelisted } = useWhitelistedCoinsQuery(currentChain)

  const sortedSwapCoins = useSortedByBalanceCoins(currentChain)
  const options = useMemo(() => {
    const vaultCoinsForChain = coins.filter(c => c.chain === currentChain)

    const allOptions = withoutDuplicates(
      [
        ...sortedSwapCoins,
        ...(knownTokens[currentChain] ?? []).filter(
          coin => !vaultCoinsForChain.some(vc => areEqualCoins(vc, coin))
        ),
        ...(whitelisted ?? []).filter(
          coin => !vaultCoinsForChain.some(vc => areEqualCoins(vc, coin))
        ),
      ],
      areEqualCoins
    )

    if (currentChain === Chain.Solana) {
      const hasNativeSol = allOptions.some(
        coin => coin.chain === Chain.Solana && !coin.id && isFeeCoin(coin)
      )

      if (hasNativeSol) {
        return allOptions.filter(
          coin =>
            !(
              coin.chain === Chain.Solana &&
              coin.id?.toLowerCase() === NATIVE_MINT.toBase58().toLowerCase()
            )
        )
      }
    }

    return allOptions
  }, [currentChain, sortedSwapCoins, whitelisted, coins])

  const { t } = useTranslation()

  const coinOptions = useMemo(
    () =>
      coins.filter(
        c => isOneOf(c.chain, swapEnabledChainsForVault) && isFeeCoin(c)
      ),
    [coins, swapEnabledChainsForVault]
  )

  const { footerRef, scrollToKey, setCenteredKey, onKeyDown, setItemRef } =
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
            await createCoin(newValue)
            onChange(newValue)
          }
        }
        onClose()
      }}
      getKey={v => coinKeyToString(v)}
      options={options}
      renderFooter={() => (
        <VStack gap={12}>
          <SwapHorizontalDivider />
          <VStack gap={8}>
            <Text height="large" centerHorizontally color="shy" size={12}>
              {t('select_chain')}
            </Text>

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
                      setCenteredKey(chain)
                      scrollToKey(chain)
                      if (!isActive) onChange(c)
                    }}
                    isActive={isActive}
                    key={chain}
                    data-key={chain}
                    data-testid={`swap-explorer-chain-${chain}`}
                  >
                    <CoinIcon coin={c} style={{ fontSize: 16 }} />
                    <Text size={12} weight={500}>
                      {chain}
                    </Text>
                  </FooterItem>
                )
              })}
            </CarouselWrapper>
          </VStack>
        </VStack>
      )}
    />
  )
}

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
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 99px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  outline: none;

  scroll-snap-align: center;
  scroll-snap-stop: always;

  &[data-centered='true'] {
    border-color: ${({ theme }) => theme.colors.buttonPrimary.toCssValue()};
    background: rgba(6, 27, 58, 0.02);
    box-shadow: 0 0 14px 0 rgba(33, 85, 223, 0.45);
  }

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
