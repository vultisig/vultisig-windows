import { OtherChain } from '@core/chain/Chain'

import { TxHashResolver } from './TxHashResolver'

export const getSuiTxHash: TxHashResolver<OtherChain.Sui> = ({ signature }) => {
  // For Sui, we can derive the transaction hash from the signature
  // This is a simplified approach - in practice, you might need to decode the signature
  return Buffer.from(signature).toString('hex')
}
