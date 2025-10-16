import { FeeAmount } from '../../../chain/feeQuote/amount'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useDepositFeeQuoteQuery } from '../queries/useDepositFeeQuoteQuery'

export const DepositFee = () => {
  const [{ chain }] = useDepositCoin()

  const feeQuoteQuery = useDepositFeeQuoteQuery()

  return <FeeAmount feeQuoteQuery={feeQuoteQuery} chain={chain} />
}
