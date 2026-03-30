import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { ChainOfKind } from '@vultisig/core-chain/ChainKind'
import { getCosmosChainByChainId } from '@vultisig/core-chain/chains/cosmos/chainInfo'
import { getEvmChainByChainId } from '@vultisig/core-chain/chains/evm/chainInfo'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { match } from '@vultisig/lib-utils/match'

import { getAppChainId } from './getAppChainId'

export const getAppChain: BackgroundResolver<'getAppChain'> = async ({
  context,
  input: { chainKind },
}) => {
  const appChainId = await getAppChainId({ context, input: { chainKind } })

  const chain = match(chainKind, {
    evm: () => getEvmChainByChainId(appChainId),
    cosmos: () => getCosmosChainByChainId(appChainId),
  })

  return shouldBePresent(chain) as ChainOfKind<typeof chainKind>
}
