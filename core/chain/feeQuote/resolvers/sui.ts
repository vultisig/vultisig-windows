import { getSuiClient } from '@core/chain/chains/sui/client'

import { FeeQuoteResolver } from '../resolver'

export const getSuiFeeQuote: FeeQuoteResolver<'sui'> = async () => {
  const client = getSuiClient()
  const gasPrice = await client.getReferenceGasPrice()
  return { gas: BigInt(gasPrice) }
}
