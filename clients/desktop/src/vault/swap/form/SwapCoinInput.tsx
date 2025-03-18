import { CoinKey } from '@core/chain/coin/Coin'
import { isNativeCoin } from '@core/chain/coin/utils/isNativeCoin'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { pick } from '@lib/utils/record/pick'
import { FC, useMemo } from 'react'

import { swapEnabledChains } from '../../../chain/swap/swapEnabledChains'
import { SelectItemModal } from '../../../coin/ui/inputs/SelectItemModal'
import { SwapCoinInputField } from '../../../coin/ui/inputs/SwapCoinInputField'
import { Opener } from '../../../lib/ui/base/Opener'
import { InputProps } from '../../../lib/ui/props'
import {
  useCurrentVaultCoin,
  useCurrentVaultCoins,
} from '../../state/currentVault'

export type SwapSide = 'from' | 'to'
type SwapCoinInputProps = InputProps<CoinKey> & {
  side: SwapSide
}

import { useState } from 'react'

import { ChainOption } from '../../../coin/ui/inputs/ChainOption'
import { CoinOption } from '../../../coin/ui/inputs/CoinOption'
import { Match } from '../../../lib/ui/base/Match'

export const SwapCoinInput: FC<SwapCoinInputProps> = ({
  value,
  onChange,
  side,
}) => {
  const [modalTypeOpen, setModalTypeOpen] = useState<'chain' | 'coin' | 'none'>(
    'none'
  )

  const coin = useCurrentVaultCoin(value)
  const coins = useCurrentVaultCoins()

  const chainOptions = useMemo(
    () =>
      coins.filter(
        coin => isOneOf(coin.chain, swapEnabledChains) && isNativeCoin(coin)
      ),
    [coins]
  )

  const coinOptions = useMemo(
    () => coins.filter(c => c.chain === coin?.chain),
    [coins, coin]
  )

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <SwapCoinInputField
          value={{ ...value, ...pick(coin, ['logo', 'ticker']) }}
          onChainClick={() => {
            onOpen()
            setModalTypeOpen('chain')
          }}
          onCoinClick={() => {
            onOpen()
            setModalTypeOpen('coin')
          }}
          side={side}
        />
      )}
      renderContent={() => (
        <Match
          value={modalTypeOpen}
          none={() => null}
          chain={() => (
            <SelectItemModal
              titleKey="select_network"
              optionComponent={ChainOption}
              onFinish={(newValue: CoinKey | undefined) => {
                if (newValue) {
                  onChange(newValue)
                }
                setModalTypeOpen('none')
              }}
              options={chainOptions}
            />
          )}
          coin={() => (
            <SelectItemModal
              titleKey="choose_tokens"
              optionComponent={CoinOption}
              onFinish={(newValue: CoinKey | undefined) => {
                if (newValue) {
                  onChange(newValue)
                }
                setModalTypeOpen('none')
              }}
              options={coinOptions}
            />
          )}
        />
      )}
    />
  )
}
