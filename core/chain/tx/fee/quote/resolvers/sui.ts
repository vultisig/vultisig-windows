import { getSuiClient } from '../../../../chains/sui/client'

export const getSuiFeeQuote = async () => {
  const client = getSuiClient()

  return client.getReferenceGasPrice()
}
