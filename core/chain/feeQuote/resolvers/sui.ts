import { getSuiClient } from '@core/chain/chains/sui/client'

import { suiGasBudget } from '../../chains/sui/config'
import { FeeQuoteResolver } from '../resolver'

export const getSuiFeeQuote: FeeQuoteResolver<'sui'> = async () => {
  const client = getSuiClient()
  const referenceGasPrice = await client.getReferenceGasPrice()
  return { referenceGasPrice, gasBudget: suiGasBudget }
}
