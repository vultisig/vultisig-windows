import { CoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { swapEnabledChains } from '@core/chain/swap/swapEnabledChains'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { CoinOption } from '@core/ui/chain/coin/inputs/CoinOption'
import {
  useCurrentVaultCoin,
  useCurrentVaultCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { Opener } from '@lib/ui/base/Opener'
import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { SelectItemModal } from '@lib/ui/inputs/SelectItemModal'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { InputProps, IsActiveProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { pick } from '@lib/utils/record/pick'
import { FC } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useTransferDirection } from '../../../state/transferDirection'
import { ChainOption } from '../components/ChainOption'
import { SwapCoinInputField } from '../components/SwapCoinInputField'
import { useToCoin } from '../state/toCoin'

export const SwapCoinInput: FC<InputProps<CoinKey>> = ({ value, onChange }) => {
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false)
  const [isChainModalOpen, setIsChainModalOpen] = useState(false)
  const { t } = useTranslation()
  const coins = useCurrentVaultCoins()
  const coin = shouldBePresent(useCurrentVaultCoin(value))
  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const [currentToCoin] = useToCoin()
  const side = useTransferDirection()

  const coinOptions = coins.filter(
    coin => isOneOf(coin.chain, swapEnabledChains) && isFeeCoin(coin)
  )

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <SwapCoinInputField
          value={{ ...value, ...pick(coin, ['logo', 'ticker']) }}
          onChainClick={() => {
            onOpen()
            setIsChainModalOpen(true)
          }}
          onCoinClick={() => {
            onOpen()
            setIsCoinModalOpen(true)
          }}
        />
      )}
      renderContent={() => (
        <>
          {isCoinModalOpen && (
            <SelectItemModal
              renderListHeader={() => (
                <HStack alignItems="center" gap={6}>
                  <Text color="shy" size={12} weight={500}>
                    {t('chain')}
                  </Text>
                  <HStack
                    style={{
                      cursor: 'pointer',
                    }}
                    tabIndex={0}
                    role="button"
                    onClick={() => {
                      setIsChainModalOpen(true)
                    }}
                    gap={4}
                  >
                    <CoinIcon coin={coin} style={{ fontSize: 16 }} />
                    <HStack alignItems="center">
                      <Text size={12} weight={500}>
                        {coin.chain}
                      </Text>
                      <ChevronDownIcon />
                    </HStack>
                  </HStack>
                </HStack>
              )}
              filterFunction={(option, query) =>
                option.ticker.toLowerCase().startsWith(query.toLowerCase())
              }
              title={t('select_asset')}
              optionComponent={CoinOption}
              onFinish={(newValue: CoinKey | undefined) => {
                if (newValue) {
                  onChange(newValue)
                }
                setIsCoinModalOpen(false)
              }}
              options={coins.filter(c => c.chain === coin?.chain)}
              renderFooter={() => (
                <Footer>
                  {coinOptions.map(coin => {
                    const chain = coin.chain
                    return (
                      <FooterItem
                        isActive={
                          side === 'from'
                            ? chain === fromCoinKey.chain
                            : chain === currentToCoin.chain
                        }
                        key={chain}
                      >
                        <CoinIcon coin={coin} style={{ fontSize: 16 }} />
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
          {isChainModalOpen && (
            <SelectItemModal
              title={t('select_network')}
              optionComponent={props => {
                const currentItemChain = props.value.chain
                const isSelected =
                  side === 'from'
                    ? currentItemChain === fromCoinKey.chain
                    : currentItemChain === currentToCoin.chain

                return <ChainOption {...props} isSelected={isSelected} />
              }}
              onFinish={(newValue: CoinKey | undefined) => {
                if (newValue) {
                  onChange(newValue)
                }
                setIsChainModalOpen(false)
              }}
              options={coinOptions}
              filterFunction={(option, query) =>
                option.chain.toLowerCase().startsWith(query.toLowerCase())
              }
            />
          )}
        </>
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

  padding: 8px 12px 8px 8px;
  border-radius: 99px;

  ${({ isActive, theme }) =>
    isActive &&
    `
      /* One off colors, not adding them to the theme */
      background: rgba(6, 27, 58, 0.01);
      box-shadow: 0 0 13.7px 0 rgba(33, 85, 223, 0.68);
      border: 1px solid ${theme.colors.buttonPrimary.toCssValue()};
  `}
`
