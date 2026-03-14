import { ZcashPreparedTx } from './zcashSapling'

let storedPreparedTx: ZcashPreparedTx | null = null

export const setZcashPreparedTx = (tx: ZcashPreparedTx) => {
  storedPreparedTx = tx
}

export const consumeZcashPreparedTx = (): ZcashPreparedTx | null => {
  const tx = storedPreparedTx
  storedPreparedTx = null
  return tx
}
