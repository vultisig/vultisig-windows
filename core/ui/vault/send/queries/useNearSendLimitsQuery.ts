import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { getNearSendLimits } from '@vultisig/core-chain/chains/near/sendLimits'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'

import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'

/**
 * What a native NEAR send must keep back — the gas reservation for this
 * receiver and the balance backing the sender's own storage — and so the most
 * it can move. Disabled for every other coin.
 */
export const useNearSendLimitsQuery = () => {
  const coin = useCurrentSendCoin()
  const [receiver] = useSendReceiver()

  return useQuery({
    queryKey: ['nearSendLimits', coin.address, receiver],
    queryFn: () => getNearSendLimits({ address: coin.address, receiver }),
    enabled: coin.chain === Chain.Near && isFeeCoin(coin) && !!receiver,
  })
}
