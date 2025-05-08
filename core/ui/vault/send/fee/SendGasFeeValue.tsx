import { formatFee } from '@core/chain/tx/fee/format/formatFee'

import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendChainSpecific } from './SendChainSpecificProvider'

export const SendGasFeeValue = () => {
  const chainSpecific = useSendChainSpecific()
  const [coinKey] = useCurrentSendCoin()
  const { chain } = coinKey
  const fees = formatFee({
    chain: chain,
    chainSpecific,
  })

  return <>{fees}</>
}
