import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

import { useFeeQuoteQuery } from '../../../../chain/feeQuote/query'
import { useCurrentVaultCoin } from '../../../state/currentVaultCoins'

export const useReferralFeeQuoteQuery = () => {
  const coin = useCurrentVaultCoin(chainFeeCoin.THORChain)

  return useFeeQuoteQuery({ coin })
}
