import { getChainKind } from '@core/chain/ChainKind'
import { stripHexPrefix } from '@lib/utils/hex/stripHexPrefix'
import { match } from '@lib/utils/match'
import { omit } from '@lib/utils/record/omit'
import { TypedDataEncoder } from 'ethers'
import { keccak256 } from 'viem'

import { CustomMessageSupportedChain } from './chains'

type GetCustomMessageHexInput = {
  chain: CustomMessageSupportedChain
  message: string
  method: string
}

export const getCustomMessageHex = ({
  chain,
  message,
  method,
}: GetCustomMessageHexInput) => {
  if (method === 'eth_signTypedData_v4') {
    const { domain, types, message: msg } = JSON.parse(message)
    return stripHexPrefix(
      TypedDataEncoder.hash(domain, omit(types, 'EIP712Domain'), msg)
    )
  }

  const bytes = message.startsWith('0x')
    ? Buffer.from(stripHexPrefix(message), 'hex')
    : new TextEncoder().encode(message)

  return match(getChainKind(chain), {
    evm: () => stripHexPrefix(keccak256(bytes)),
    solana: () => Buffer.from(bytes).toString('hex'),
    tron: () => stripHexPrefix(keccak256(bytes)),
  })
}
