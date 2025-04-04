import { CoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { isNativeCoin } from '@core/chain/coin/utils/isNativeCoin'
import { Opener } from '@lib/ui/base/Opener'
import { ChevronDownIcon } from '@lib/ui/icons/ChevronDownIcon'
import { HStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { pick } from '@lib/utils/record/pick'
import { FC } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { swapEnabledChains } from '../../../chain/swap/swapEnabledChains'
import { ChainCoinIcon } from '../../../chain/ui/ChainCoinIcon'
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc'
import { getCoinLogoSrc } from '../../../coin/logo/getCoinLogoSrc'
import { ChainOption } from '../../../coin/ui/inputs/ChainOption'
import { CoinOption } from '../../../coin/ui/inputs/CoinOption'
import { SelectItemModal } from '../../../coin/ui/inputs/SelectItemModal'
import { SwapCoinInputField } from '../../../coin/ui/inputs/SwapCoinInputField'
import { shouldDisplayChainLogo } from '../../chain/utils'
import {
  useCurrentVaultCoin,
  useCurrentVaultCoins,
} from '../../state/currentVault'

export const SwapCoinInput: FC<InputProps<CoinKey>> = ({ value, onChange }) => {
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false)
  const [isChainModalOpen, setIsChainModalOpen] = useState(false)
  const { t } = useTranslation()
  const coins = useCurrentVaultCoins()
  const coin = useCurrentVaultCoin(value)

  if (!coin) return
  const { logo, chain, ticker, id } = coin

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
                    <ChainCoinIcon
                      coinSrc={getCoinLogoSrc(logo)}
                      chainSrc={
                        shouldDisplayChainLogo({
                          ticker: ticker,
                          chain: chain,
                          isNative: isFeeCoin({
                            id: id,
                            chain: chain,
                          }),
                        })
                          ? getChainEntityIconSrc(chain)
                          : undefined
                      }
                      style={{ fontSize: 16 }}
                    />
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
            />
          )}

          {isChainModalOpen && (
            <SelectItemModal
              title={t('select_network')}
              optionComponent={ChainOption}
              onFinish={(newValue: CoinKey | undefined) => {
                if (newValue) {
                  onChange(newValue)
                }
                setIsChainModalOpen(false)
              }}
              options={coins.filter(
                coin =>
                  isOneOf(coin.chain, swapEnabledChains) && isNativeCoin(coin)
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
