import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { EvmChain } from '@vultisig/core-chain/Chain'
import { getEvmClient } from '@vultisig/core-chain/chains/evm/client'

import { getAppChain } from './getAppChain'

export const evmClientRequest: BackgroundResolver<'evmClientRequest'> = async ({
  context,
  input: { method, params },
}) => {
  const chain = await getAppChain({ context, input: { chainKind: 'evm' } })
  const client = getEvmClient(chain as EvmChain)

  return client.request({
    method: method as any,
    params: params as any,
  })
}
