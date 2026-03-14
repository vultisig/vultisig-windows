import { MoneroPreparedTx } from './moneroSpend'

let storedPreparedTx: MoneroPreparedTx | null = null

export const setMoneroPreparedTx = (preparedTx: MoneroPreparedTx) => {
  storedPreparedTx = preparedTx
}

export const consumeMoneroPreparedTx = (): MoneroPreparedTx | null => {
  const preparedTx = storedPreparedTx
  storedPreparedTx = null
  return preparedTx
}
