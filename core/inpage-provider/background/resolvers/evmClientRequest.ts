import { getBackgroundEvmClient } from '@core/inpage-provider/background/core/getBackgroundEvmClient'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { EvmChain } from '@vultisig/core-chain/Chain'

import { getAppChain } from './getAppChain'

export const evmClientRequest: BackgroundResolver<'evmClientRequest'> = async ({
  context,
  input: { method, params },
}) => {
  const chain = await getAppChain({ context, input: { chainKind: 'evm' } })
  const client = getBackgroundEvmClient(chain as EvmChain)

  return client.request({
    method: method as any,
    params: params as any,
  })
}
