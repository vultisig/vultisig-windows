import { formatFee } from '@core/chain/tx/fee/format/formatFee'

import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendChainSpecific } from './SendChainSpecificProvider'

export const SendGasFeeValue = () => {
  const chainSpecific = useSendChainSpecific()
  const [{ coin: coinKey }] = useCurrentSendCoin()
  const fees = formatFee({
    chain: coinKey.chain,
    chainSpecific,
  })

  return <>{fees}</>
}
