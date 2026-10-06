import { Chain } from '@vultisig/core-chain/Chain'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

import { useSendAllowDeathPreference } from '../state/allowDeath'
import { useCurrentSendCoin } from '../state/sendCoin'

const allowDeathChains = [Chain.Polkadot, Chain.Bittensor] as const

type SendAllowDeath = {
  /** The coin is native DOT or TAO, whose transfer can empty the account. */
  isAvailable: boolean
  /** The send signs `transfer_allow_death`. Never true when unavailable. */
  isEnabled: boolean
  setEnabled: (value: boolean) => void
}

/**
 * Whether the current send can empty the account, and whether the user chose
 * to. Only a native Polkadot or Bittensor transfer can; everything else keeps
 * the account alive whatever the stored preference says.
 */
export const useSendAllowDeath = (): SendAllowDeath => {
  const coin = useCurrentSendCoin()
  const [preference, setEnabled] = useSendAllowDeathPreference()

  const isAvailable = isFeeCoin(coin) && isOneOf(coin.chain, allowDeathChains)

  return {
    isAvailable,
    isEnabled: isAvailable && preference,
    setEnabled,
  }
}
