import { getSuiClient } from '../../../../chains/sui/client'
import { FeeQuote } from '../core'
import { FeeQuoteInput, FeeQuoteResolver } from '../resolver'

export const getSuiFeeQuote: FeeQuoteResolver<'Sui'> = async (
  _input: FeeQuoteInput<'Sui'>
): Promise<FeeQuote<'sui'>> => {
  const client = getSuiClient()
  const gasPrice = await client.getReferenceGasPrice()
  return BigInt(gasPrice)
}
