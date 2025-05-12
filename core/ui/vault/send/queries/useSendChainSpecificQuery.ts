import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { ChainSpecificResolverInput } from '@core/mpc/keysign/chainSpecific/ChainSpecificResolver'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useStateDependentQuery } from '@lib/ui/query/hooks/useStateDependentQuery'

import { getChainSpecificQueryKey } from '../../../chain/coin/queries/useChainSpecificQuery'
import { useFeeSettings } from '../fee/settings/state/feeSettings'
import { useSendAmount } from '../state/amount'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'

export const useSendChainSpecificQuery = () => {
  const [{ coin: coinKey }] = useCurrentSendCoin()
  const coin = useCurrentVaultCoin(coinKey)
  const [feeSettings] = useFeeSettings()

  const [receiver] = useSendReceiver()

  const [amount] = useSendAmount()

  return useStateDependentQuery({
    state: {
      amount: amount ?? undefined,
    },
    getQuery: ({ amount }) => {
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
    },
  })
}
