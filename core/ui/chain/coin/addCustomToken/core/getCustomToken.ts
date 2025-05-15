import { getChainKind } from '@core/chain/ChainKind'

import { CustomTokenEnabledChainKind } from './chains'
import { CustomTokenResolver } from './CustomTokenResolver'
import { getEvmCustomToken } from './evm'

const handlers: Record<
  CustomTokenEnabledChainKind,
  CustomTokenResolver<any>
> = {
  evm: getEvmCustomToken,
  solana: async () => {
    throw new Error('Not implemented')
  },
}

export const getCustomToken: CustomTokenResolver = async input => {
  const chainKind = getChainKind(input.chain)

  const handler = handlers[chainKind]

  return handler(input)
}
