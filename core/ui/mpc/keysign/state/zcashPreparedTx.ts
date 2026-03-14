import { ZcashPreparedTx } from '@core/mpc/keysign/signingInputs/zcashSapling'
import { createContext, useContext } from 'react'

const ZcashPreparedTxContext = createContext<ZcashPreparedTx | null>(null)

export const useZcashPreparedTx = () => useContext(ZcashPreparedTxContext)
