import { OtherChain } from '@core/chain/Chain'
import { sha512 } from 'ethers'

import { TxHashResolver } from './TxHashResolver'

export const getRippleTxHash: TxHashResolver<OtherChain.Ripple> = ({
  encoded,
}) => {
  const fullHash = sha512(encoded)
  const first256 = fullHash.slice(0, 32)
  return Buffer.from(first256).toString('hex').toUpperCase()
}
