import { useChainSpecificQuery } from '../../../chain/coin/queries/useChainSpecificQuery'
import { useFeeSettings } from '../fee/settings/state/feeSettings'
import { useSendAmount } from '../state/amount'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'

export const useSendChainSpecificQuery = () => {
  const coin = useCurrentSendCoin()
  const [feeSettings] = useFeeSettings()
  const [receiver] = useSendReceiver()
  const [amount] = useSendAmount()

  return useChainSpecificQuery({
    coin,
    receiver,
    feeSettings,
    amount: amount ?? 0n,
  })
}
