import { areEqualCoins, CoinKey } from '@vultisig/core-chain/coin/Coin'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'
import { useCurrentVaultCoins } from '../../state/currentVaultCoins'

type UseSwapRetryInput = {
  fromCoin: CoinKey
  /** Absent on a payload that never named its destination; no retry then. */
  toCoin: CoinKey | undefined
  /** Drop the screen the retry starts from, so Back does not return to it. */
  replace?: boolean
}

/**
 * The action behind a failed swap's "Try again": open the swap form with the
 * same pair selected and nothing else — no amount, no quote, no review step.
 * The user re-enters the amount and sees a fresh route before signing.
 *
 * Returns `undefined` when either coin is no longer in the vault: the form
 * asserts both are present, so sending the user there would crash it.
 */
export const useSwapRetry = ({
  fromCoin,
  toCoin,
  replace,
}: UseSwapRetryInput): (() => void) | undefined => {
  const navigate = useCoreNavigate()
  const coins = useCurrentVaultCoins()

  const hasCoin = (key: CoinKey) => coins.some(coin => areEqualCoins(coin, key))

  if (!toCoin || !hasCoin(fromCoin) || !hasCoin(toCoin)) return undefined

  return () =>
    navigate({ id: 'swap', state: { fromCoin, toCoin } }, { replace })
}
