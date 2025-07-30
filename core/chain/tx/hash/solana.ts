import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { OtherChain } from '@core/chain/Chain'

import { TxHashResolver } from './TxHashResolver'

export const getSolanaTxHash: TxHashResolver<OtherChain.Solana> = ({
  encoded,
}) =>
  bs58.encode(
    Uint8Array.prototype.slice.call(Buffer.from(encoded, 'base64'), 1, 65)
  )
