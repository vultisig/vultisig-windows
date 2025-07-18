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
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { SelectItemModal } from '@lib/ui/inputs/SelectItemModal'
import { HStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { pick } from '@lib/utils/record/pick'
import { FC } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useSendFormFieldState } from '../state/formFields'
import { ChainOption } from './ChainOption'
import { SendCoinInputField } from './SendCoinInputField'

export const SendCoinInput: FC<InputProps<CoinKey>> = ({ value, onChange }) => {
  const [hasUserSelectedCoin, setHasUserSelectedCoin] = useState(false)
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false)
  const [isChainModalOpen, setIsChainModalOpen] = useState(false)

  const [, setFormFieldState] = useSendFormFieldState()
  const { t } = useTranslation()
  const coins = useCurrentVaultCoins()
  const coin = useCurrentVaultCoin(value)

  const handleAutoAdvance = () => {
    setFormFieldState(state => ({
      ...state,
      field: 'address',
    }))
  }

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <SendCoinInputField
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
                  if (!hasUserSelectedCoin) {
                    setHasUserSelectedCoin(true)
                    handleAutoAdvance()
                  }
                }
                setIsCoinModalOpen(false)
              }}
              options={coins.filter(c => c.chain === coin?.chain)}
            />
          )}
          {isChainModalOpen && (
            <SelectItemModal
              title={t('select_network')}
              optionComponent={props => (
                <ChainOption
                  {...props}
                  isSelected={props.value.chain === coin.chain}
                />
              )}
              onFinish={(newValue: CoinKey | undefined) => {
                if (newValue) {
                  onChange(newValue)
                }
                setIsChainModalOpen(false)
              }}
              options={coins.filter(
                coin =>
                  isOneOf(coin.chain, swapEnabledChains) && isFeeCoin(coin)
              )}
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
