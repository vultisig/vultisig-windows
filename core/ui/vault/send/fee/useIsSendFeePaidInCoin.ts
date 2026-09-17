import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'

import { useCurrentSendCoin } from '../state/sendCoin'
import { useTonGaslessSend } from './tonGasless/useTonGaslessSend'

/**
 * Whether the fee comes out of the balance being sent: a native send, or a
 * gasless TON jetton send whose relay commission is charged in the jetton. The
 * amount input, the balance check and the MAX button all reserve the fee from
 * the same balance in either case.
 */
export const useIsSendFeePaidInCoin = () => {
  const coin = useCurrentSendCoin()
  const { isEnabled: isTonGasless } = useTonGaslessSend()

  return isFeeCoin(coin) || isTonGasless
}
