import { getChainKind } from '@core/chain/ChainKind'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { match } from '@lib/utils/match'
import { keccak256 } from 'viem'

import { CustomMessageSupportedChain } from './chains'

type GetCustomMessageHexInput = {
  chain: CustomMessageSupportedChain
  message: string
}

export const getCustomMessageHex = ({
  chain,
  message,
}: GetCustomMessageHexInput) => {
  const bytes = message.startsWith('0x')
    ? Buffer.from(stripHexPrefix(message), 'hex')
    : new TextEncoder().encode(message)

  return match(getChainKind(chain), {
    evm: () => stripHexPrefix(keccak256(bytes)),
    solana: () => Buffer.from(bytes).toString('hex'),
    tron: () => stripHexPrefix(keccak256(bytes)),
  })
}
