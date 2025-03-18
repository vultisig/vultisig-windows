import { CoinKey } from '@core/chain/coin/Coin'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { pick } from '@lib/utils/record/pick'
import { FC, useMemo } from 'react'

import { swapEnabledChains } from '../../../chain/swap/swapEnabledChains'
import { SelectCoinOverlay } from '../../../coin/ui/inputs/SelectCoinOverlay'
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

export const SwapCoinInput: FC<SwapCoinInputProps> = ({
  value,
  onChange,
  side,
}) => {
  const coin = useCurrentVaultCoin(value)
  const coins = useCurrentVaultCoins()
  const options = useMemo(
    () => coins.filter(coin => isOneOf(coin.chain, swapEnabledChains)),
    [coins]
  )

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <SwapCoinInputField
          value={{ ...value, ...pick(coin, ['logo', 'ticker']) }}
          onClick={onOpen}
          side={side}
        />
      )}
      renderContent={({ onClose }) => (
        <SelectCoinOverlay
          onFinish={(newValue: CoinKey | undefined) => {
            if (newValue) {
              onChange(newValue)
            }
            onClose()
          }}
          options={options}
        />
      )}
    />
  )
}
