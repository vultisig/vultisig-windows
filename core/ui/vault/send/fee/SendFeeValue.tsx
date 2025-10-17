import { FeeAmount } from '../../../chain/feeQuote/amount'
import { useSendFeeQuoteQuery } from '../queries/useSendFeeQuoteQuery'
import { useCurrentSendCoin } from '../state/sendCoin'

export const SendFeeValue = () => {
  const { chain } = useCurrentSendCoin()

  const feeQuoteQuery = useSendFeeQuoteQuery()

  return <FeeAmount feeQuoteQuery={feeQuoteQuery} chain={chain} />
}
