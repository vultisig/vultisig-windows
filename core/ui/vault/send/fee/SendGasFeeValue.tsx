import { formatFee } from '@core/chain/tx/fee/format/formatFee'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'

import { useKeysignUtxoInfo } from '../../../mpc/keysign/utxo/queries/keysignUtxoInfo'
import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendChainSpecific } from './SendChainSpecificProvider'

export const SendGasFeeValue = () => {
  const chainSpecific = useSendChainSpecific()
  const coin = useCurrentSendCoin()
  const { data: utxoInfo } = useKeysignUtxoInfo({
    chain: coin.chain,
    address: coin.address,
  })
  const [sendAmount] = useSendAmount()

  const fees = formatFee({
    chain: coin.chain,
    amount: getFeeAmount({
      chainSpecific,
      utxoInfo,
      amount: sendAmount,
      chain: coin.chain,
    }),
  })

  return <>{fees}</>
}
