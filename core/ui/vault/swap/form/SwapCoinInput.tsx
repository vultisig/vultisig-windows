import { CoinKey } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { swapEnabledChains } from '@core/chain/swap/swapEnabledChains'
import {
  useCurrentVaultCoin,
  useCurrentVaultCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { SelectItemModal } from '@lib/ui/inputs/SelectItemModal'
import { HStack } from '@lib/ui/layout/Stack'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { pick } from '@lib/utils/record/pick'
import { FC, useMemo } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useTransferDirection } from '../../../state/transferDirection'
import { ChainOption } from '../components/ChainOption'
import { SwapCoinInputField } from '../components/SwapCoinInputField'
import { useToCoin } from '../state/toCoin'
import { useChainSummaries } from './hooks/useChainSummaries'
import { SwapCoinsExplorer } from './SwapCoinsExplorer'

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

  return (
    <>
      <SwapCoinInputField
        value={{ ...value, ...pick(coin, ['logo', 'ticker']) }}
        onChainClick={() => setOpened('chain')}
        onCoinClick={() => setOpened('coin')}
      />
      {opened === 'coin' && (
        <SwapCoinsExplorer
          onClose={() => setOpened(null)}
          value={value}
          onChange={onChange}
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
