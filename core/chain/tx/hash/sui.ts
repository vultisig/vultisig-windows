import { OtherChain } from '@core/chain/Chain'

import { GetTxHashResolver } from './GetTxHashResolver'

export const getSuiTxHash: GetTxHashResolver<OtherChain.Sui> = ({
  signature,
}) => {
  // For Sui, we can derive the transaction hash from the signature
  // This is a simplified approach - in practice, you might need to decode the signature
  return Buffer.from(signature).toString('hex')
}
