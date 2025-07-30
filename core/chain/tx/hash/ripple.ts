import { OtherChain } from '@core/chain/Chain'
import { sha512 } from 'ethers'

import { GetTxHashResolver } from './GetTxHashResolver'

export const getRippleTxHash: GetTxHashResolver<OtherChain.Ripple> = ({
  encoded,
}) => {
  const fullHash = sha512(encoded)
  const first256 = fullHash.slice(0, 32)
  return Buffer.from(first256).toString('hex').toUpperCase()
}
