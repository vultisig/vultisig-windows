import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'

import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendChainSpecific } from './SendChainSpecificProvider'

export const SendGasFeeValue = () => {
  const chainSpecific = useSendChainSpecific()
  const coin = useCurrentSendCoin()
  const fees = formatFee({
    chain: coin.chain,
    amount: getFeeAmount(chainSpecific),
  })

  return <>{fees}</>
}
