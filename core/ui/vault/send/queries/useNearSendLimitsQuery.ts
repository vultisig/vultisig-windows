import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import {
  isNearAccountId,
  isNearImplicitAccountId,
} from '@vultisig/core-chain/chains/near/accountId'
import { getNearSendLimits } from '@vultisig/core-chain/chains/near/sendLimits'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'

import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'

// Any implicit account other than the sender reserves the same gas, the most a receiver can.
const implicitReceiverStandIn = '0'.repeat(64)

/**
 * The receiver a NEAR send's limits are sized for. Only its kind changes the
 * gas reservation (the sender itself, an implicit account, a named one), so a
 * receiver not typed yet, or not a NEAR account, is sized as an implicit one.
 */
export const getNearLimitsReceiver = (receiver: string): string =>
  isNearAccountId(receiver) ? receiver : implicitReceiverStandIn

/**
 * What a native NEAR send must keep back — the gas reservation for the
 * receiver's kind and the balance backing the sender's own storage — and so
 * the most it can move. Disabled for every other coin.
 */
export const useNearSendLimitsQuery = () => {
  const coin = useCurrentSendCoin()
  const [receiver] = useSendReceiver()
  const limitsReceiver = getNearLimitsReceiver(receiver)

  return useQuery({
    queryKey: [
      'nearSendLimits',
      coin.address,
      limitsReceiver === coin.address,
      isNearImplicitAccountId(limitsReceiver),
    ],
    queryFn: () =>
      getNearSendLimits({ address: coin.address, receiver: limitsReceiver }),
    enabled: coin.chain === Chain.Near && isFeeCoin(coin),
  })
}
