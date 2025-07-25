import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/ChainSpecificResolver'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'

import { getChainSpecificQueryKey } from '../../../chain/coin/queries/useChainSpecificQuery'
import { useFeeSettings } from '../fee/settings/state/feeSettings'
import { useSendAmount } from '../state/amount'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'

export const useSendChainSpecificQuery = () => {
  const coin = useCurrentSendCoin()
  const [feeSettings] = useFeeSettings()
  const [receiver] = useSendReceiver()
  const [amount] = useSendAmount()

  return useStateDependentQuery(
    {
      amount: amount ?? 0,
    },
    ({ amount }) => {
      const input: ChainSpecificResolverInput = {
        coin,
        receiver,
        feeSettings,
        amount,
      }

      return {
        queryKey: getChainSpecificQueryKey(input),
        queryFn: () => getChainSpecific(input),
      }
    }
  )
}
