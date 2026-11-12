import { areEqualCoins, extractCoinKey } from '@vultisig/core-chain/coin/Coin'
import { FeeSettings } from '@vultisig/core-mpc/keysign/chainSpecific/FeeSettings'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentSendCoin } from './sendCoin'

/**
 * The advanced fee settings the user chose, shared by the amount step and
 * Verify so both build the payload with the same value. Settings are tied to
 * the coin they were chosen for and are never applied to another one.
 */
export const useSendFeeSettings = () => {
  const [{ feeSettings: choice }, setState] = useCoreViewState<'send'>()
  const coin = useCurrentSendCoin()

  const feeSettings =
    choice && areEqualCoins(choice.coin, coin) ? choice.value : undefined

  const setFeeSettings = (value: FeeSettings) => {
    setState(prev => ({
      ...prev,
      feeSettings: { coin: extractCoinKey(coin), value },
    }))
  }

  return [feeSettings, setFeeSettings] as const
}
